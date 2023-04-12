import requests
import json

api_url = 'https://www.page2api.com/api/v1/scrape'
payload = {
      "api_key": "4879829f48737536a45c3994b150a2ec2f8cb6d3", #Limited usage available for this api_key
      "url": "https://www.glassdoor.com/Reviews/Glassdoor-Reviews-E100431.htm", # URL hardcoded for Glassdoor company review for now
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
          "iterations": 5,
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
print(reviews) 
