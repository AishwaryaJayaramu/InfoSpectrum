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

        url = "http://newsapi.org/v2/everything?q={0}&page=1&pageSize=20&apiKey={1}&sortBy=popularity".format(name,api_key)
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
def place_score_api(name):
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
        print(score)
    except Exception as e:
        score = {'Cost of Living':0,
        'Commute':0,
        'Safety':0,
        'Environmental Quality':0,
        'Taxation':0}
        print("The Place Score Api have exception")
        traceback.print_exc()
    return Response(response=jsonpickle.encode(score), status=200, mimetype="application/json")


@app.route('/description/<name>')
def description_api(name):
    try:
        if(name.find('New York')!=-1):
            name = "New York City"

        wikiLink='https://en.wikipedia.org/wiki/'+name.replace(" ","_")
        if(name.find('_')==-1):
            url ="https://en.wikipedia.org/w/api.php?action=opensearch&search={}&limit=1&namespace=0&format=json".format(name)
            response=requests.get(url).json()
            wikiLink = response[3][0]
            name = response[1][0]

        url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=1&explaintext=1&titles={}".format(name)
        response=requests.get(url).json()
        Page_id = list(response['query']['pages'].keys())[0]
        result = {}
        result['description'] = response['query']['pages'][Page_id]['extract']
        result['url'] = wikiLink
    except Exception as e:
        result = {"description":"","url":""}
        print("The wikipedia Api have exception ")
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
    return Response(response=jsonpickle.encode(data), status=200, mimetype="application/json")


@app.route("/layoff/<company>", methods=["GET"])
def layoff(company):
    #Get all the config info from config.ini
    connection_string = configur['DATABASE']['CONNECTION_STRING']
    database = configur['DATABASE']['DB']

    #Get layoff details from database
    client = MongoClient(connection_string)
    db = client[database]
    collection = db['layoff_info']

    pattern = re.compile(f'.*{company}.*', re.IGNORECASE)
    
    result = []
    for data in collection.find({'Company':{'$regex': pattern}}):
        if 'Address' in data:
            address=data['Address']
        else:
             address ="NA"      
        result.append({'Location': str(data['County/Parish']),'Received Date': str(data['Received_Date']),'Effective Date': str(data['Effective_Date']),'No of Employees': str(data['No_Of_Employees']),'Address': address})
    return jsonify({'data':result})

    
@app.route('/location_scores/<name>')
def location_scores(name):
    loc_url = "http://localhost:8000/locations/{}".format(name)
    result = requests.get(loc_url).json()
    if 'error' in result:
        abort(404, description="Requested item not found")
    locations = result['Locations']
    data = []
    for loc in locations:
        location = loc['City']
        scores_url = "http://localhost:8000/place/scores/{}".format((location))
        scores = requests.get(scores_url).json()
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

    document = collections.find_one({'company_name': name})
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


    document = collections.find_one({'company_name': name})
    symbol = document['ticker_symbol']
    period = request.args.get('period', default="1y")
    interval = request.args.get('interval', default="1d")

	#pull the quote
    quote = yf.Ticker(symbol)	
	#use the quote to pull the historical data from Yahoo finance
    hist = quote.history(period=period, interval=interval)
	#convert the historical data to JSON
    data = hist.to_json()
	#return the JSON in the HTTP response
    return Response(response=jsonpickle.encode(data), status=200, mimetype="application/json")

# This is the / route, or the main landing page route.
@app.route("/")
def home():
	# we will use Flask's render_template method to render a website template.
    return render_template("homepage.html")

if __name__ == '__main__':
    app.debug = True
    getUAValues()
    app.run(host="localhost",port=8000)