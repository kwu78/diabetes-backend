from flask import Flask, jsonify
from flask_cors import CORS
import random
import os
app = Flask(__name__)
CORS(app)

@app.route('/predict_diabetes_by_id', methods=['GET'])

##TODO: 
def predict_diabetes_by_id():
    ##return the likelihood that the user will have diabetes by the id that's passed in from frontend
    # to achieve, first get patient info_by_id to get all the features, transform into model-acceptable-one-hot encoding,then predict using the model
    diabetes_likelihood = random.randint(20, 80) 
    return jsonify({"diabetes_likelihood": diabetes_likelihood})

@app.route('/get_patient_info_by_id',methods=['GET'])
def get_patient_info_by_id():
    return {}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)