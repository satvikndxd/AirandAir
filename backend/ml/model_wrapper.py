"""Model wrapper class for improved AQI prediction model."""

class ImprovedAQIModel:
    """Wrapper class for the improved AQI prediction model."""
    def __init__(self, model, scaler):
        self.model = model
        self.scaler = scaler
        
    def predict(self, X):
        import pandas as pd
        # Add engineered features if not present
        X_eng = X.copy()
        if 'PM_ratio' not in X_eng.columns:
            X_eng['PM_ratio'] = X_eng['PM2.5'] / (X_eng['PM10'] + 1)
            X_eng['PM_total'] = X_eng['PM2.5'] + X_eng['PM10']
            X_eng['NOx_O3_ratio'] = X_eng['NO2'] / (X_eng['O3'] + 1)
            X_eng['Industrial_indicator'] = X_eng['SO2'] * X_eng['CO']
            X_eng['Traffic_indicator'] = X_eng['NO2'] * X_eng['CO']
        
        feature_order = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3',
                       'PM_ratio', 'PM_total', 'NOx_O3_ratio',
                       'Industrial_indicator', 'Traffic_indicator']
        
        X_scaled = self.scaler.transform(X_eng[feature_order])
        return self.model.predict(X_scaled)
