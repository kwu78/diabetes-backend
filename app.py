from flask import Flask, jsonify, request
from flask_cors import CORS
import src.util as util
import os
app = Flask(__name__)
CORS(app)

@app.route('/login_authenticate/', methods=['GET'])
def login():
    _id  = request.args.get('username', type=str, default='')
    _password  = request.args.get('password', type=str, default='')
    if not _id:
        status = False
        message = 'Authentication failed: missing username'
    elif not _password:
        status = False
        message = 'Authentication failed: missing password'
    else:
        status, message = util.authenticate(_id, _password)
    return jsonify({'_id': _id, '_password': _password, 'message': message, 'status': status})

@app.route('/get_patient_info_by_id/<_id>', methods=['GET'])
def get_patient_info_by_id(_id):
    features = get_features_by_id(_id)
    diabetes_likelihood = util.ml_predict(features)
    def smoking_reverse_map(x,y):
        if x == 1:
            return "No"
        if y == 1:
            return "Yes"
        else:
            return "Unknown"

    return jsonify({"_id": _id,
                    "name": "Patient 1",
                    "gender": {0 : "Female", 1 : "Male"}.get(features[0][0]),
                    "age": features[0][1],
                    "hypertension": {0 : "No", 1 : "Yes"}.get(features[0][2]),
                    "bmi": features[0][3],
                    "HbA1c_level": features[0][4],
                    "blood_glucose_level" : features[0][5],
                    "smoking" : smoking_reverse_map(features[0][6], features[0][7]),
                    "diabetes_likelihood" : diabetes_likelihood,
                    }
                   )

def get_features_by_id(_id):
    # gender age hypertension bmi HbA1c_level blood_glucose_level smoking_1(no) smoking_2(yes)
    
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
        smoking = patient_observations[patient_observations['code_display'] == 'Tobacco smoking status']['value'].tolist()[0]
        smoking_tuple = (0,1) if smoking == 1 else (1,0)
        hypertension = 0
        if systolic > 120 or diastolic > 80:
            hypertension = 1
    return ((gender, age, hypertension, bmi, HbA1c_level, blood_glucose_level, smoking_tuple[0], smoking_tuple[1]),) # mock feature array
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)