from flask import Flask, Response, abort,request,render_template, jsonify
import yfinance as yf
import requests
import json
import re
import jsonpickle
from pprint import pprint
from flask_cors import CORS
# from news_key import *
import traceback
from pymongo import MongoClient
import requests
from jsonmerge import merge
from configparser import ConfigParser
from flask import Flask, jsonify
import tweepy
from twitter_keys import *
from tweet import Sentiment
from Scraper import fetch_and_insert_into_DB
import nltk
import os
nltk.download('vader_lexicon')
from elasticsearch import Elasticsearch



uaDict ={}
config_file = "config.ini"
configur = ConfigParser()
configur.read(config_file)
app=Flask(__name__)
CORS(app)

@app.errorhandler(404)
def not_found(e):
    return jsonify(error=str(e)), 404

@app.route('/company/<name>')
def company_news(name):
    try:

        url = "http://newsapi.org/v2/everything?q={0}&page=1&pageSize=20&apiKey={1}&sortBy=popularity".format(name,"cf1e2b517cc346bcbc225d6069de5488")
        print(url)
        response = requests.get(url).json()
        #pprint(response)

        articles = response['articles']
    except Exception as e:
        articles = []
        print("The News Api have exception ")
        traceback.print_exc()
    return Response(response=jsonpickle.encode(articles), status=200, mimetype="application/json")


@app.route('/place/image/<name>')
def image_api(name):
    getUAValues()
    try:
        global uaDict
        url = "{}images/".format(str(uaDict[name.title()]))
        print(url)
        response = requests.get(url).json()
        #pprint(response)
        image = {}
        image['url'] = str(response['photos'][0]['image']['web'])
    except Exception as e:
        image = {"url":""}
        print("The Place Image Api have exception ")
        traceback.print_exc()
    return Response(response=jsonpickle.encode(image), status=200, mimetype="application/json")

@app.route('/place/scores/<name>')
def get_place_scores(name):
    score = place_score_api(name)
    return Response(response=jsonpickle.encode(score), status=200, mimetype="application/json")

def get_from_db(name):
    connection_string = configur['DATABASE']['CONNECTION_STRING']
    database = configur['DATABASE']['DB']

    #Get layoff details from database
    client = MongoClient(connection_string)
    db = client[database]
    collections = db['place_scores']
    document = collections.find_one({'city': re.compile(name, re.IGNORECASE)}, {'_id': False})
    # print(document)
    if not document:
        name = re.split('[ ,/]',name)[0]
        document = collections.find_one({'city': re.compile(name, re.IGNORECASE)}, {'_id': False})
        if not document:
            return {}
    data  = {'Cost of Living':document["cost_of_living"],
        'Commute':document["commute"],
        'Safety':document["safety"],
        'Environmental Quality':document["environmental_quality"],
        'Taxation':document["taxation"]}
    return data

def place_score_api(name):
    getUAValues()
    try:
        url = "{}scores/".format(str(uaDict[name.title()]))
        result=requests.get(url)
        response = result.json()
        #pprint(response)
        score={}
        score['Cost of Living'] = 10.0 - round(response['categories'][1]['score_out_of_10'],2)
        score['Commute'] = round(response['categories'][5]['score_out_of_10'],2)
        score['Safety'] = round(response['categories'][7]['score_out_of_10'],2)
        score['Environmental Quality'] = round(response['categories'][10]['score_out_of_10'],2)
        score['Taxation'] =10.0- round(response['categories'][12]['score_out_of_10'],2)
        # print(score)
    except Exception as e:
        score = {'Cost of Living':0,
        'Commute':0,
        'Safety':0,
        'Environmental Quality':0,
        'Taxation':0}
        data = get_from_db(name.capitalize())
        if data != {}:
            score = data
        # print("The Place Score Api have exception")
        # traceback.print_exc()
    return score



@app.route('/description/<name>')
def description_api(name):
    try:
        url = 'https://companies-datas.p.rapidapi.com/v2/company'
        headers = {
	    "X-RapidAPI-Key": os.getenv("RAPIDAPI_KEY"),
	    "X-RapidAPI-Host": "companies-datas.p.rapidapi.com"
    }
        querystring = {"query":name+".com"}

        response = requests.request("GET", url, headers=headers, params=querystring)    
        json_data = response.json()
        result = {"description":json_data['description']}
        # result = {"description":"WIll come soon"}
        
    except Exception as e:
        print("The Rapid Api have exception ")
        traceback.print_exc()
    return Response(response=jsonpickle.encode(result), status=200, mimetype="application/json")


def getUAValues():
    global uaDict
    url = "https://api.teleport.org/api/urban_areas/"
    response = requests.get(url).json()

    response = response['_links']['ua:item']

    for item in response:
        uaDict[item['name']]=item['href']
        
@app.route('/place/housing/<city>')
def get_rents(city):
    getUAValues()
    global uaDict
    try:
        url = "{}details".format(uaDict[city.title()])
        
        response = requests.get(url).json()
        response = response['categories']
        temp={}
        for item in response:
            if item['id']!='HOUSING':
                continue
            else:
                temp =item['data']
                break
        response = temp
        rents = []
        label = []
        
        for index in reversed(range(3)):
            label.append(response[index]['label'])
            rents.append(int(response[index]['currency_dollar_value']))
        housing={}
        housing['rents']=rents
        housing['label']=label
        


    except Exception as e:

        print("The Rent Api have exception ")
        traceback.print_exc()
        housing = {'rents':[],'label':[]}

    return Response(response=jsonpickle.encode(housing), status=200, mimetype="application/json")

@app.route("/locations/<name>")
def get_locations(name):
    data = office_locations(name)
    return Response(response=jsonpickle.encode(data), status=200, mimetype="application/json")

def office_locations(name):
    #Get all the config info from config.ini
    connection_string = configur['DATABASE']['CONNECTION_STRING']
    database = configur['DATABASE']['DB']

    #Get location details from database
    client = MongoClient(connection_string)
    db = client[database]
    collections = db['company_locations']
    # document = collections.find_one({'name': name})
    name = name.capitalize()
    document = collections.find_one({'name': name}, {'_id': False})
    if not document:
        abort(404, description="Requested item not found")
    data = {"Name": document['name'],
            "Headquaters": document['headquarters']['city'] + ", " + document['headquarters']['state'],
            "Locations": []}
    for location in document["locations"].values():
        cityData = {}
        cityData["City"] = location["city"]
        cityData["State"] = location["state"]
        data["Locations"].append(cityData)
    return data

@app.route("/layoff/<company>", methods=["GET"])
def layoff(company):
    ELASTIC_PASSWORD = os.getenv("ELASTIC_PASSWORD")
    CLOUD_ID = os.getenv("CLOUD_ID")
    es = Elasticsearch(
        cloud_id=CLOUD_ID,
        basic_auth=("elastic", ELASTIC_PASSWORD)
    )

    try:
        search_word = company
        query = {
            "query": {
                "match": {
                    "Company_First_Word": {
                        "query": search_word
                    }
                }
            },
            "size": 100,
            "_source": {
                "excludes": ["Company_First_Word"]
            }
        }

        res = es.search(index="search-layoff", body=query)
        result = []
        for hit in res["hits"]["hits"]:
            result.append(hit["_source"])
        return jsonify({'data': result})

    except Exception as e:
        return jsonify({'error': str(e)})

    
@app.route('/location_scores/<name>')
def location_scores(name):
    # loc_url = "http://localhost:8000/locations/{}".format(name)
    # result = requests.get(loc_url).json()
    result = office_locations(name)
    if 'error' in result:
        abort(404, description="Requested item not found")
    locations = result['Locations']
    data = []
    for loc in locations:
        location = loc['City']
        # scores_url = "http://localhost:8000/place/scores/{}".format((location))
        # scores = requests.get(scores_url).json()
        scores = place_score_api(location)
        data.append(merge(loc, scores))
    return Response(response=jsonpickle.encode(data), status=200, mimetype="application/json")

# API Route for pulling the stock quote
@app.route("/quote/<name>")
def display_quote(name):
    #Get all the config info from config.ini
    connection_string = configur['DATABASE']['CONNECTION_STRING']
    database = configur['DATABASE']['DB']

    #Get ticker symbol from database
    client = MongoClient(connection_string)
    db = client[database]
    collections = db['ticker_info']

    pattern = re.compile(f'.*{name}.*', re.IGNORECASE)
    document = collections.find_one({'company_name': {'$regex': pattern}})
    symbol = document['ticker_symbol']

	# pull the stock quote
    quote = yf.Ticker(symbol)

	#return the object via the HTTP Response
    print(jsonify(quote.info))
    return jsonify(quote.info)


# API route for pulling the stock history
@app.route("/history/<name>")
def display_history(name):
	
    #Get all the config info from config.ini
    connection_string = configur['DATABASE']['CONNECTION_STRING']
    database = configur['DATABASE']['DB']

    #get the query string parameters
    client = MongoClient(connection_string)
    db = client[database]
    collections = db['ticker_info']
    pattern = re.compile(f'.*{name}.*', re.IGNORECASE)
    document = collections.find_one({'company_name': {'$regex': pattern}})
    symbol = document['ticker_symbol']
    period = request.args.get('period', default="1y")
    interval = request.args.get('interval', default="1d")

	#pull the quote
    quote = yf.Ticker(symbol)	
	#use the quote to pull the historical data from Yahoo finance
    hist = quote.history(period=period, interval=interval)
    hist = hist.loc[:,['Close']]

    # Convert dataframe to dictionary
    data_dict = hist.to_dict('records')

    # Create list of objects with desired format
    result = []
    for row in hist.iterrows():
        date = row[0].strftime('%Y-%m-%d')
        close = row[1][0]
        result.append({'date': date, 'Price': close})

	#convert the historical data to JSON
    data = hist.to_json()
	#return the JSON in the HTTP response
    return jsonify(result)

auth = tweepy.OAuthHandler(tw_consumer_key, tw_consumer_secret)
auth.set_access_token(tw_access_token, tw_access_token_secret)
api = tweepy.API(auth)


@app.route('/tweets/<query>')
def tweets(query):
    tweets = []
    descriptions = set()  # set to keep track of unique tweet descriptions
    
    for tweet in tweepy.Cursor(api.search_tweets, q=query, lang='en').items(50):
        # Check if the description is already in the set
        if tweet.text not in descriptions:
            # Create a dictionary to store the tweet information of interest
            tweet_info = {}
            tweet_info['description'] = tweet.text  # tweet description
            tweet_info['hashtags'] = [tag['text'] for tag in tweet.entities['hashtags']]  # hashtags
            tweet_info['link'] = f"https://twitter.com/i/web/status/{tweet.id_str}"  # tweet link
            tweets.append(tweet_info)
            
            # Add the description to the set
            descriptions.add(tweet.text)
    
    return jsonify(tweets)




@app.route('/sentiment_analysis/<company>')
def sentiment_analysis(company):
    sentiment = Sentiment()
    sentiment.authenticate()
    hashtag = "#"+company
    sentiment.get_Tweets(hashtag)
    sentiment.process_Tweets()
    sentiment.compute_Sentiment()
    return sentiment.get_Sentiment()

@app.route('/fetch_reviews/<company>')
def fetch_reviews(company):
    connection_string = configur['DATABASE']['CONNECTION_STRING']
    database = configur['DATABASE']['DB']
    client = MongoClient(connection_string)
    db = client[database]
    collection = db[company]
    reviews = []
    for review in collection.find():
        reviews.append({
            'title': review['title'],
            'author_info': review['author_info'],
            'rating': review['rating'],
            'pros': review['pros'],
            'cons': review['cons'],
            'helpful': review['helpful']
        })
    return jsonify(reviews)
    

    
if __name__ == '__main__':
    app.debug = True
    getUAValues()
    app.run(port=8000)