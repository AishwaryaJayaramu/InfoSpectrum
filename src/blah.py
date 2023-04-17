from flask import Flask, jsonify
import tweepy

app = Flask(__name__)


consumer_key = '3jmA1BqasLHfItBXj3KnAIGFB'
consumer_secret = 'imyEeVTctFZuK62QHmL1I0AUAMudg5HKJDfkx0oR7oFbFinbvA'
access_token = '265857263-pF1DRxgIcxUbxEEFtLwLODPzD3aMl6d4zOKlMnme'
access_token_secret = 'uUFoOOGeNJfOYD3atlcmPtaxxniXxQzAU4ESJLopA1lbC'

# Authenticate with the Twitter API using the Tweepy library
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)
api = tweepy.API(auth)


@app.route('/search_tweets/<query>')
def search_tweets(query):
    tweets = []
    for tweet in tweepy.Cursor(api.search, q=query, lang='en').items(10):
        # Create a dictionary to store the tweet information of interest
        tweet_info = {}
        tweet_info['description'] = tweet.text  # tweet description
        tweet_info['hashtags'] = [tag['text'] for tag in tweet.entities['hashtags']]  # hashtags
        tweet_info['link'] = f"https://twitter.com/i/web/status/{tweet.id_str}"  # tweet link
        tweets.append(tweet_info)
    return jsonify(tweets)


if __name__ == '__main__':
    app.run(port=5004, debug=True)
