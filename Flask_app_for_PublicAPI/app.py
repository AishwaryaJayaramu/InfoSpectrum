from flask import Flask, Response
import requests
import json
import jsonpickle
from pprint import pprint
from flask_cors import CORS
from news_key import *
import traceback

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

    
if __name__ == '__main__':
    app.debug = True
    app.run(port=8000)