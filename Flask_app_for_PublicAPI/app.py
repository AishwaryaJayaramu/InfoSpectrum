from flask import Flask, Response
import requests
import json
import jsonpickle
from pprint import pprint
from flask_cors import CORS
from news_key import *
import traceback

uaDict ={}
app=Flask(__name__)
CORS(app)



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


    
if __name__ == '__main__':
    app.debug = True
    app.run(port=8000)