import pandas as pd

class DataFrameFromJSONMixin:
    def __init__(self, path):
        self.path = path
        self.data = self._load_data()

    def _load_data(self) -> pd.DataFrame:
        return pd.read_json(self.path, lines = True)