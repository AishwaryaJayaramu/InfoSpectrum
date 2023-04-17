from flask import Flask
import requests

app = Flask(__name__)

@app.route('/company_description/<string:name>')
def get_company_description(name):
    url = 'https://companies-datas.p.rapidapi.com/v2/company'
    headers = {
	"X-RapidAPI-Key": "b64aba31ccmsh62873a1d06a643cp122e99jsne058cb1ca081",
	"X-RapidAPI-Host": "companies-datas.p.rapidapi.com"
}
    querystring = {"query":name+".com"}

    response = requests.request("GET", url, headers=headers, params=querystring)    
    json_data = response.json()
    print(json_data)
    
    return json_data["description"]

if __name__ == '__main__':
    app.run()
