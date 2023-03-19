import numpy as np
import pandas as pd
import re
import math
import datetime as dt
import nltk
import json
import matplotlib.pyplot as plt

import tweepy
import yfinance as yf
import unicodedata

import auth_key as key

class Sentiment:

	def __init__(self):
		self.num_tweets = 2

	def authenticate(self):
		auth = tweepy.OAuthHandler(key.consumer_key, key.consumer_secret)
		auth.set_access_token(key.access_token, key.access_token_secret)
		self.user = tweepy.API(auth)
		try:
			self.user = tweepy.API(auth, wait_on_rate_limit=True)
			print("Authentication Sucessful.")
		except:
			print("Authentication Failed.")

	def get_Tweets(self, keyword):
		data = tweepy.Cursor(self.user.search_tweets, q=str(keyword), since_id="2023-01-01", tweet_mode="extended", lang='en').items(self.num_tweets)
		tweets_list = []
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
		temp = pd.DataFrame(columns=["Date", "Tweets"])

		for ind, tweet in self.raw_data.iterrows():
			print(tweet)
			body = tweet["Tweets"]
			body = re.sub("[^ a-zA-Z0-9]", "", body)
			temp.sort_index()
			temp.at[ind, "Date"] = tweet["Date"]
			temp.at[ind, "Tweets"] = body
			ind += 1

		self.data = pd.DataFrame(columns=["Date", "Tweets"])
		body = ""
		ind = 0

		for i in range(len(temp) - 1):
			cur_date = temp.Date.iloc[i]
			next_date = temp.Date.iloc[i + 1]

			if (str(cur_date) == str(next_date)):
				body = body + temp.Tweets.iloc[i] + " "
			else:
				self.data.at[ind, "Date"] = cur_date
				self.data.at[ind, "Tweets"] = body
				ind += 1
				body = ""
  
	def driver(self):
		self.authenticate()
		self.get_Tweets("#VmWare")
		self.read_Tweets("tweets.csv")
		self.process_Tweets()
		# self.compute_Sentiment()
		# self.get_Sentiment()
		# self.plot()

if __name__ == "__main__":
	sentiment = Sentiment()
	sentiment.driver()
