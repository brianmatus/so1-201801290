import random
import time

from locust import HttpUser, task, between
import json

API_HOST = "http://146.148.87.142:80"

MAX_SEDES = 100
departments = []
municipalities = []
papers = []
parties = []


def init():
    with open('departments.json') as json_file:
        global departments
        departments = json.load(json_file)

    with open('municipalities.json') as json_file:
        global municipalities
        municipalities = json.load(json_file)

    with open('papers.json') as json_file:
        global papers
        papers = json.load(json_file)

    with open('parties.json') as json_file:
        global parties
        parties = json.load(json_file)


def getRandomVote():
    vote = {"sede": random.randint(0, MAX_SEDES), "departamento": departments[random.randint(0, len(departments) - 1)]}

    valid_municipalities = [m for m in municipalities if m["dpt_id"] == vote["departamento"]["id"]]
    vote["municipio"] = valid_municipalities[random.randint(0, len(valid_municipalities) - 1)]["name"]

    vote["papeleta"] = papers[random.randint(0, len(papers) - 1)]["name"]
    vote["partido"] = parties[random.randint(0, len(parties) - 1)]["name"]

    vote["departamento"] = vote["departamento"]["name"]
    return vote


class MyUser(HttpUser):
    init()
    host = API_HOST
    wait_time = between(0.5, 1.0)

    @task
    def my_task(self):
        headers = {'Content-Type': 'application/json'}
        the_vote = getRandomVote()
        print(the_vote)
        response = self.client.post('/new_vote', headers=headers, data=json.dumps(the_vote))
        if response.status_code != 200:
            print(f'Response error: {response.status_code}')
        # time.sleep(50)
