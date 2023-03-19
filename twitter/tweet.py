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
import auth_key as key

class Sentiment:

	def __init__(self):
		self.num_tweets = 1000

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
			# print(tweet)
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
			
	def compute_Sentiment(self):
		self.data["Negative"] = ""
		self.data["Neutral"] = ""
		self.data["Positive"] = ""
		analyzer = SentimentIntensityAnalyzer()
		
		for ind, row in self.data.T.iteritems():
			try:
				str_norm = unicodedata.normalize('NFKD', self.data.loc[ind, 'Tweets'])
				str_sentiment = analyzer.polarity_scores(str_norm)
				self.data.at[ind, 'Negative'] = str_sentiment['neg']
				self.data.at[ind, 'Neutral'] = str_sentiment['neu']
				self.data.at[ind, 'Positive'] = str_sentiment['pos']
			except TypeError:
				print("Sentiment Failed.")

	def get_Sentiment(self):
		values = {}
		values['Sentiment'] = []

		for ind, body in self.data.T.iteritems():
			values['Sentiment'].append({
				'Date': str(self.data.Date.iloc[ind]),
				'positive': float(self.data.Positive.iloc[ind]),
				'neutral': float(self.data.Neutral.iloc[ind]),
				'negative': float(self.data.Negative.iloc[ind])
			})
		
		with open('sentiment.json', 'w') as outfile:
			json.dump(values, outfile)

		return(json.dumps(values)) 

	def plot(self):
		labels = ["Positive", "Neutral", "Negative"]
		points = {}
		colors = ["gold", "yellowgreen", "lightcoral"]

		for ind, body in self.data.T.iteritems():
			# print(ind)
			points[str(self.data.Date.iloc[ind])] = [float(self.data.Positive.iloc[ind])]
			points[str(self.data.Date.iloc[ind])].append(float(self.data.Neutral.iloc[2]))
			points[str(self.data.Date.iloc[ind])].append(float(self.data.Negative.iloc[2]))

			fig = plt.figure(ind)
			p = [i * 100 for i in points[str(self.data.Date.iloc[ind])]]
			plt.pie(p, colors=colors, labels=labels, autopct='%.2f', startangle=45)
			plt.axis('equal')
			plt.title(str(self.data.Date.iloc[ind]))
			if not os.path.exists("graphs"):
				os.mkdir("graphs")
			fig.savefig("graphs/" + str(self.data.Date.iloc[ind]) + ".png")

	def driver(self):
		self.authenticate()
		self.get_Tweets("#VmWare")
		self.read_Tweets("tweets.csv")
		self.process_Tweets()
		self.compute_Sentiment()
		self.get_Sentiment()
		self.plot()

if __name__ == "__main__":
	sentiment = Sentiment()
	sentiment.driver()
