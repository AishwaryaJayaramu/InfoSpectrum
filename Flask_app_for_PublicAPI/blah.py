from pymongo import MongoClient
from configparser import ConfigParser


config_file = "config.ini"
configur = ConfigParser()
configur.read(config_file)

connection_string = configur['DATABASE']['CONNECTION_STRING']
database = configur['DATABASE']['DB']

    #Get location details from database
client = MongoClient(connection_string)
db = client[database]
collections = db['company_locations']

print(collections)