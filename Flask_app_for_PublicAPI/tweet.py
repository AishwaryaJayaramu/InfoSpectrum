import numpy as np
import pandas as pd
import re
import math
import datetime as dt
import nltk
import json
import matplotlib.pyplot as plt
import os
import tweepy
import yfinance as yf
import unicodedata
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import twitter_keys as key
# import swifter
# import auth_key as key


class Sentiment:

	def __init__(self):
		self.num_tweets = 10

	def authenticate(self):
		auth = tweepy.OAuthHandler(key.tw_consumer_key, key.tw_consumer_secret)
		auth.set_access_token(key.tw_access_token, key.tw_access_token_secret)
		self.user = tweepy.API(auth)
		try:
			self.user = tweepy.API(auth, wait_on_rate_limit=True)
			print("Authentication Sucessful.")
		except:
			print("Authentication Failed.")

	def get_Tweets(self, keyword):
		print("instide get_tweets")
		data = tweepy.Cursor(self.user.search_tweets, q=str(keyword), since_id="2023-04-01", tweet_mode="extended", lang='en').items(self.num_tweets)
		tweets_list = []
		# print(data)
		for tweet in data:
			# print(tweet.created_at.date())
			# print(tweet.full_text)
			tweets_list.append([tweet.created_at.date(), tweet.full_text])
		self.raw_data = pd.DataFrame(data=tweets_list, columns=["Date", "Tweets"])
		# self.raw_data = pd.DataFrame(data=[[tweet.created_at.date(), tweet.full_text] for tweet in data], columns=["Date", "Tweets"])
		# print(self.raw_data)
		self.raw_data.to_csv("Tweets.csv")


	def read_Tweets(self, file):
		self.raw_data = pd.read_csv(file, names=["Date", "Tweets"])

	def process_Tweets(self):
     
		self.raw_data["Tweets"] = self.raw_data["Tweets"].apply(lambda x: str(x).replace("[^ a-zA-Z0-9]", ""))

		self.data = pd.DataFrame(columns=["Date", "Tweets"])
		body = ""
		# print("bhargav!!!!!! self.data")
		# print(self.raw_data)
			
	def compute_Sentiment(self):
		self.raw_data["Negative"] = ""
		self.raw_data["Neutral"] = ""
		self.raw_data["Positive"] = ""
		analyzer = SentimentIntensityAnalyzer()
		# remove first row of raw_data
		
		self.raw_data = self.raw_data.iloc[1:]
		print(self.raw_data)
        # remove first row of raw_data
        
		self.raw_data["Normalized"] = self.raw_data["Tweets"].apply(lambda x: unicodedata.normalize('NFKD', x))
		self.raw_data["Sentiment"] = self.raw_data["Normalized"].apply(lambda x: analyzer.polarity_scores(x))
		self.raw_data["Negative"] = self.raw_data["Sentiment"].apply(lambda x: x["neg"])
		self.raw_data["Neutral"] = self.raw_data["Sentiment"].apply(lambda x: x["neu"])
		self.raw_data["Positive"] = self.raw_data["Sentiment"].apply(lambda x: x["pos"])

	def get_Sentiment(self):

		values = { 
            'Positive': round(self.raw_data["Positive"].mean(), 2),
        	'Neutral': round(self.raw_data["Neutral"].mean(), 2),
        	'Negative': round(self.raw_data["Negative"].mean(), 2)
    }
  
		
		with open('sentiment.json', 'w') as outfile:
			json.dump(values, outfile)

		return(json.dumps(values)) 

