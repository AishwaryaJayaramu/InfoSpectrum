from flask import Flask, request, Response
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS
from urllib.parse import quote
from pprint import pprint
from datetime import datetime
from nltk.sentiment.vader import SentimentIntensityAnalyzer

import csv
import tweepy
import jsonpickle
import requests
import time
import unicodedata

from twitter_keys import *

# init server
twitter_api = None
app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')



def construct_tweet(status):

    tweet_text = ""
    if hasattr(status, 'retweeted_status') and hasattr(status.retweeted_status, 'extended_tweet'):
        tweet_text = status.retweeted_status.extended_tweet['full_text']
    elif hasattr(status, 'full_text'):
        tweet_text = status.full_text
    else:
        tweet_text = status.text

    tweet_data = {
        'id_str': status.id_str,
        'user': {
            'name': status.user.name,
            'screen_name': status.user.screen_name,
            'profile_image_url': status.user.profile_image_url
        },
        'text': tweet_text,
        'created_at': str(status.created_at),
        'favorite_count': status.favorite_count,
        'retweet_count': status.retweet_count,
        'entities': {
            'urls': status.entities['urls'] if 'urls' in status.entities else [],
            'user_mentions': status.entities['user_mentions'] if 'user_mentions' in status.entities else [],
            'hashtags': status.entities['hashtags'] if 'hashtags' in status.entities else [],
            'symbols': status.entities['symbols'] if 'symbols' in status.entities else []
        }

        
    }
    if 'media' in status.entities:
            tweet_data['entities']['media']=status.entities['media']

    return tweet_data


class TweetStreamListener(tweepy.StreamListener):

    def __init__(self):
        self.backoff_timeout = 1
        super(TweetStreamListener,self).__init__()

    def on_status(self, status):
        global socketio

        #reset timeout
        self.backoff_timeout = 1

        #send message on namespace
        tweet = construct_tweet(status)
        socketio.emit('tweet', jsonpickle.encode(tweet), namespace='/company_tweets')

    def on_error(self, status_code):

        # exp back-off if rate limit error
        if status_code == 420:
            time.sleep(self.backoff_timeout)
            self.backoff_timeout *= 2
            return True
        else:
            print("Error {0} occurred".format(status_code))
            return False

tweet_stream = None

@socketio.on('connect', namespace='/company_tweets')
def company_tweet_connect():
    global tweet_stream
    global twitter_api

    #create listener to listen for company tweets
    listener = TweetStreamListener()
    print("reached listener")
    tweet_stream = tweepy.Stream(auth = twitter_api.auth, listener=listener, tweet_mode='extended')


@socketio.on('disconnect', namespace='/company_tweets')
def company_tweet_disconnect():
    global tweet_stream

    print("Client disconnected")

    #stop stream
    tweet_stream.disconnect()
    tweet_stream = None


@socketio.on('start', namespace='/company_tweets')
def start_tweet_streaming(company):
    #start stream to listen to company tweets
    global tweet_stream
    print("reached start")
    auth = tweepy.OAuthHandler('3jmA1BqasLHfItBXj3KnAIGFB', 'imyEeVTctFZuK62QHmL1I0AUAMudg5HKJDfkx0oR7oFbFinbvA')
    auth.set_access_token('265857263-pF1DRxgIcxUbxEEFtLwLODPzD3aMl6d4zOKlMnme', 'uUFoOOGeNJfOYD3atlcmPtaxxniXxQzAU4ESJLopA1lbC')
    try:
        api = tweepy.API(auth)
        tweet_stream = tweepy.Stream(auth=api.auth, listener=TweetStreamListener())
        tweet_stream.filter(track=["Python", "Java", "Ruby"])
    except tweepy.TweepError as e:
        print("Error: " + str(e))
    # listener = TweetStreamListener()
    # tweet_stream = tweepy.Stream(auth = twitter_api.auth, listener=listener, tweet_mode='extended')
    # print(tweet_stream.filter(track=[company],languages=['en']))


    # return


total_positive = 0
total_negative = 0
total_neutral = 0
total_processed = 0
quit_flag = True


def do_sentiment_analysis(analyzer, tweets):
    global total_negative
    global total_neutral
    global total_positive
    global total_processed

    total_processed += len(tweets)

    #run sentiment analysis and update totals
    for tweet in tweets:

        tweet_text = ""
        if hasattr(tweet, 'retweeted_status') and hasattr(tweet.retweeted_status, 'extended_tweet'):
            tweet_text = tweet.retweeted_status.extended_tweet['full_text']
        elif hasattr(tweet, 'full_text'):
            tweet_text = tweet.full_text
        else:
            tweet_text = tweet.text
                
        str_norm = unicodedata.normalize("NFKD", tweet_text)
        scores = analyzer.polarity_scores(str_norm)
        scores.pop('compound')

        top_sentiment = sorted(scores, key=scores.get, reverse=True)[0]
        if top_sentiment == 'pos':
            total_positive += 1
        elif top_sentiment == 'neg':
            total_negative += 1
        else:
            total_neutral += 1


@socketio.on('start', namespace='/sentiments')
def sentiment_start_streaming(company):
    global twitter_api
    global total_negative
    global total_neutral
    global total_positive
    global total_processed
    global quit_flag

    def chunks(lst,n):
        for i in range(0, len(lst), n):
            yield lst[i:i+n]

    try:
        #twitter allows max 180 calls in 15 minutes, so wait for 5 seconds b/w calls
        while(True):

            #search for tweets for this company
            results = []
            results = twitter_api.search(q=company, lang='en', count=100, tweet_mode="extended")
            print(results)

            if len(results) == 0:
                break

            analyzer = SentimentIntensityAnalyzer()

            #process tweets in chunks of 20
            for chunk in chunks(results,20):
                if quit_flag:
                    return

                do_sentiment_analysis(analyzer, chunk)

                #construct and emit response
                resp = {'data':[{'id':'Negative','label':'Negative','value':total_negative},{'id':'Positive','label':'Positive','value':total_positive},{'id':'Neutral','label':'Neutral','value':total_neutral}],
                        'total_processed': total_processed }
                
                print("sent response {0}".format(resp))
                socketio.emit('sentiment', jsonpickle.encode(resp), namespace='/sentiments')

                time.sleep(1)

    except Exception as e:
        print("Exception occurred {0}".format(e))


@socketio.on('connect', namespace='/sentiments')
def sentiment_disconnect():
    global quit_flag

    #allow streaming to begin
    quit_flag = False


@socketio.on('disconnect', namespace='/sentiments')
def sentiment_disconnect():
    global quit_flag
    #signal streaming api to stop
    quit_flag = True


"""
@socketio.on_error_default
def default_error_handler(e):
    print("error occurred")
    print(request.event["message"])
    print(request.event["args"])
"""


def get_twitter_connection():

    api = None
    try:
        auth = tweepy.OAuthHandler(tw_consumer_key, tw_consumer_secret)
        auth.set_access_token(tw_access_token, tw_access_token_secret)
        api = tweepy.API(auth, wait_on_rate_limit=True)
    except Exception as e:
        print("Exception occurred : {0}".format(e))
    
    return api


if __name__=="__main__":

    #init twitter connection
    twitter_api = get_twitter_connection()

    socketio.run(app, host="0.0.0.0",port=5001)
