from flask import Flask, jsonify
from flask_cors import CORS
import src.util as util
import random
import os
app = Flask(__name__)
CORS(app)

@app.route('/predict_diabetes_by_id', methods=['GET'])

##TODO: 
def predict_diabetes_by_id(_id):
    ##return the likelihood that the user will have diabetes by the id that's passed in from frontend
    # to achieve, first get patient info_by_id to get all the features, transform into model-acceptable-one-hot encoding,then predict using the model
    features = get_features_by_id(_id)
    diabetes_likelihood = util.ml_predict(features)
    print(diabetes_likelihood)
    return jsonify({"diabetes_likelihood": diabetes_likelihood})

@app.route('/get_patient_info_by_id/<id>', methods=['GET'])
def get_patient_info_by_id(id):
    return jsonify({"id": id, "name": "Patient 1", "diabetes_likelihood": "50%"})

def get_features_by_id(_id):
    # gender age hypertension heart_disease bmi	HbA1c_level	blood_glucose_level smoking_1(no) smoking_2(yes)
    
    # patient-level features
    patients = util.set_up_patients()
    patient = patients[patients['id'] == _id]
    if not patient.empty:
        gender = util.gender_mapper(patient.loc[:1,'gender'].item())
        age = util.calculate_age(patient.loc[:1,'birthDate'].item())

    # observation-level features
    observations = util.set_up_observations()
    patient_observations = observations[observations['patient_id'] == _id]
    if not patient_observations.empty:
        bmi = patient_observations[patient_observations['code_display'] == 'Body mass index (BMI)']['value'].tolist()[0]
        HbA1c_level = patient_observations[patient_observations['code_display'] == 'Hemoglobin A1c/Hemoglobin']['value'].tolist()[0]
        blood_glucose_level = patient_observations[patient_observations['code_display'] == 'Glucose']['value'].tolist()[0]
        systolic = patient_observations[patient_observations['code_display'] == 'Systolic blood pressure']['value'].tolist()[0]
        diastolic = patient_observations[patient_observations['code_display'] == 'Diastolic blood pressure']['value'].tolist()[0]
        hypertension = 0
        if systolic > 120 or diastolic > 80:
            hypertension = 1
    return ((gender, age, hypertension, 0, bmi, HbA1c_level, blood_glucose_level, 0, 1),) # mock feature array
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)