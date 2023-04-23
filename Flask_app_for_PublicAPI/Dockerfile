FROM --platform=linux/amd64 python:3.9
RUN mkdir /app
ADD . /app
WORKDIR /app
RUN apt-get -y update
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install -r requirements.txt
EXPOSE $PORT
CMD gunicorn app:app