from .patients import Patients
from .observations import Observations
import datetime
import joblib
import math
import os

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
    path = os.path.join(os.path.dirname(__file__), '../ml_model/artifact/logistic_v1.sav')
    return joblib.load(path)

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