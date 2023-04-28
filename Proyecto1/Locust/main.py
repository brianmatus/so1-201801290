import random
from locust import HttpUser, task, between
import json

import mysql.connector


API_HOST = "http://34.27.184.24:80"

DB_HOST = "127.0.0.1"
DB_NAME = "so1"
DB_USER = "so1"
DB_PASS = "featupz97"

# db = mysql.connector.connect(
#     host=DB_HOST,
#     user=DB_USER,
#     password=DB_PASS,
#     database=DB_NAME
# )

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
        papers = json.load(json_file)


    # cursor = db.cursor()
    # cursor.execute("SELECT * FROM departments")
    # for row in cursor.fetchall():
    #     departments.append({
    #         "id": row[0],
    #         "name": row[1]
    #     })
    #
    # cursor.execute("SELECT * FROM municipalities")
    # for row in cursor.fetchall():
    #     municipalities.append({
    #         "id": row[0],
    #         "dpt_id": row[1],
    #         "name": row[2]
    #     })
    #
    # cursor.execute("SELECT * FROM papers")
    # for row in cursor.fetchall():
    #     papers.append({
    #         "id": row[0],
    #         "name": row[1]
    #     })
    #
    # cursor.execute("SELECT * FROM parties")
    # for row in cursor.fetchall():
    #     parties.append({
    #         "id": row[0],
    #         "name": row[1]
    #     })


def getRandomVote():
    vote = {"sede": random.randint(0, MAX_SEDES), "departamento": departments[random.randint(0, len(departments) - 1)]}

    valid_municipalities = [m for m in municipalities if m["dpt_id"] == vote["departamento"]["id"]]
    vote["municipio"] = valid_municipalities[random.randint(0, len(valid_municipalities) - 1)]["name"]

    vote["papeleta"] = papers[random.randint(0, len(papers) - 1)]["name"]
    vote["partido"] = parties[random.randint(0, len(parties) - 1)]["name"]

    vote["departamento"] = vote["departamento"]["name"]
    return vote


# class MyUser(HttpUser):
#     init()
#     host = API_HOST
#     wait_time = between(0.5, 1.0)
#
#     @task
#     def my_task(self):
#         headers = {'Content-Type': 'application/json'}
#         response = self.client.post('/new_vote', headers=headers, data=json.dumps(getRandomVote()))
#         if response.status_code != 200:
#             print(f'Response error: {response.status_code}')

# TODO delete
init()
print(departments)
print(municipalities)
print(papers)
print(parties)
