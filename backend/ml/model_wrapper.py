"""Model wrapper class for improved AQI prediction model."""

class ImprovedAQIModel:
    """Wrapper class for the improved AQI prediction model."""
    def __init__(self, model, scaler):
        self.model = model
        self.scaler = scaler
        
    def predict(self, X):
        # Expect X to be a list of dictionaries or a single dictionary
        if isinstance(X, dict):
            X = [X]
            
        import numpy as np
        
        # Feature Engineering on list of dicts
        X_processed = []
        for x in X:
            x_eng = x.copy()
            
            # Helper to safely get value or 0
            def get(key): return x_eng.get(key, 0)
            
            # Calculate derived features if missing
            if 'PM_ratio' not in x_eng:
                x_eng['PM_ratio'] = get('PM2.5') / (get('PM10') + 1)
                x_eng['PM_total'] = get('PM2.5') + get('PM10')
                x_eng['NOx_O3_ratio'] = get('NO2') / (get('O3') + 1)
                x_eng['Industrial_indicator'] = get('SO2') * get('CO')
                x_eng['Traffic_indicator'] = get('NO2') * get('CO')
            
            X_processed.append(x_eng)

        feature_order = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3',
                       'PM_ratio', 'PM_total', 'NOx_O3_ratio',
                       'Industrial_indicator', 'Traffic_indicator']
        
        # Convert to numpy array
        X_array = []
        for x in X_processed:
            row = [x.get(f, 0) for f in feature_order]
            X_array.append(row)
            
        X_array = np.array(X_array)
        
        X_scaled = self.scaler.transform(X_array)
        return self.model.predict(X_scaled)
