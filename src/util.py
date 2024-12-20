from .patients import Patients
from .observations import Observations
import datetime
import pickle
import math
import os
import json

def set_up_login():
    path = os.path.join(os.path.dirname(__file__), '../app_data/user_password.json')
    with open(path, 'r') as f:
        user_password = json.load(f)
    return user_password

def authenticate(username, password):
    dic = set_up_login()
    stored_password = dic.get(username, None)
    if not stored_password:
        return False, "Authentication failed: wrong username"
    if stored_password != password:
        return False, "Authentication failed: wrong password"
    return True, "Successful"

def set_up_patients():
    path = os.path.join(os.path.dirname(__file__), '../app_data/Patients.ndjson')
    patients = Patients(path).pipeline()
    return patients

def set_up_observations():
    path = os.path.join(os.path.dirname(__file__), '../app_data/Observations.ndjson')
    observations = Observations(path).pipeline()
    return observations

def gender_mapper(gender):
    mapper = {"female" : 0, "male" : 1, "Female" : 0, "Male" : 1}
    return mapper[gender]
    
def calculate_age(dob):
    dob_date = datetime.datetime.strptime(dob, "%Y-%m-%d").date()
    diff = abs((dob_date - datetime.date.today()).days)
    return int(math.floor(diff/365.25))

def load_ml_model():
    path = os.path.join(os.path.dirname(__file__), '../ml_model/artifact/logistic_v1.pkl')
    with open(path, 'rb') as file:
        model = pickle.load(file)
    return model

def ml_predict(features):
    model = load_ml_model()
    '''
    try-except for testing purpose, a return of -1 indicates prediction error
    '''
    try:
        score = model.predict_proba(features)[0][1]
    except:
        score = -1
    return score