from ._base import DataFrameFromJSONMixin
import pandas as pd

class Observations(DataFrameFromJSONMixin):
    def __init__(self, path):
        super().__init__(path)

    def parse_patient_id(self):
        data = self.data
        data['patient_id'] = data['subject'].apply(lambda x : x['reference'])
        data['patient_id'] = data['patient_id'].apply(lambda x : x.split("/")[-1])
        self.data = data

    def parse_observation_code(self):
        data = self.data
        data['code_display'] = data['code'].apply(lambda x : x['coding'][0]['display'])
        self.data = data

    def parse_measurement_value(self):
        data = self.data
        data['value'] = data['valueQuantity'].apply(lambda x : x['value']) 
        self.data = data
        
    def pipeline(self):
        self.parse_patient_id()
        self.parse_observation_code()
        self.parse_measurement_value()
        return self.data
