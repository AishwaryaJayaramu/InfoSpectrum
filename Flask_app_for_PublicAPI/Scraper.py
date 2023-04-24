import requests
import json
from DBConnection import insert_into_db
from URLDict import urls
import os

def fetch_and_insert_into_DB(company):

    company_review_url = urls[company.lower()]
    print(company_review_url)
    api_url = 'https://www.page2api.com/api/v1/scrape'
    payload = {
          "api_key": os.getenv("SCRAPER_KEY"), #Limited usage available for this api_key
          "url": company_review_url,
          "real_browser": True,
          "merge_loops": True,
          "premium_proxy": "us",
          "scenario": [
            {
              "loop": [
                { "wait_for": "div.gdReview" },
                { "execute": "parse" },
                { "execute_js": "document.querySelector(\".nextButton\")?.click()" }
              ],
              "iterations": os.getenv("ITERATION"),
              "stop_condition": "document.querySelector(\".nextButton\") === null"
            }
          ],
          "parse": {
            "reviews": [
              {
                "_parent": "div.gdReview",
                "title": "a.reviewLink >> text",
                "author_info": "[class*=newUiJobLine] .middle >> text",
                "rating": "span.ratingNumber >> text",
                "pros": "span[data-test=pros] >> text",
                "cons": "span[data-test=cons] >> text",
                "helpful": "div.common__EiReviewDetailsStyle__socialHelpfulcontainer >> text"
              }
            ]
          }
        }

    header = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    response = requests.post(api_url, data=json.dumps(payload), headers=header)
    reviews = json.loads(response.text)

    # To check if the reviews are fetched properly
    # print(reviews) 
    try:
      insert_into_db(company, reviews["result"]["reviews"])
    except:
       return reviews

    return reviews["result"]["reviews"]
