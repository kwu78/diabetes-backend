import pandas as pd
from ._base import DataFrameFromJSONMixin


class Patients(DataFrameFromJSONMixin):
    def __init__(self, path):
        super().__init__(path)

    def pipeline(self):
        patient_df = self.data
        return patient_df
