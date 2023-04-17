from pymongo import MongoClient
from configparser import ConfigParser

config_file = "Flask_app_for_PublicAPI/config.ini"
configure = ConfigParser()
configure.read(config_file)

for sec in configure.sections():
    print(sec)

def establish_connection():
    connection_url = configure['DATABASE']['CONNECTION_STRING']
    database = configure['DATABASE']['DB']

    client = MongoClient(connection_url)
    db = client[database]

    collection = db['Collection_name']

    return collection


def insert_into_db(reviews):
    collection = establish_connection()
    for review in reviews:
        collection.insert_one(review)

collection = establish_connection()
print(collection)