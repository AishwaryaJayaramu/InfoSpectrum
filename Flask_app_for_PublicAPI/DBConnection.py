from pymongo import MongoClient
from configparser import ConfigParser

config_file = "config.ini"
configure = ConfigParser()
configure.read(config_file)

for sec in configure.sections():
    print(sec)

def establish_connection(company):
    connection_url = configure['DATABASE']['CONNECTION_STRING']
    database = configure['DATABASE']['DB']

    client = MongoClient(connection_url)
    db = client[database]

    collection = db[company]

    return collection


def insert_into_db(company, reviews):
    collection = establish_connection(company)
    for review in reviews:
        collection.insert_one(review)
