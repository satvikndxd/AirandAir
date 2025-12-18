import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, StackingRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
import joblib
import os
import sys

# Ensure the directory exists
os.makedirs('backend/ml', exist_ok=True)

# Import the wrapper class from model_wrapper
sys.path.insert(0, os.path.dirname(__file__))
from model_wrapper import ImprovedAQIModel

def calculate_sub_aqi(concentration, breakpoints):
    """Calculate sub-AQI for a pollutant using EPA breakpoints."""
    for (c_low, c_high, aqi_low, aqi_high) in breakpoints:
        if c_low <= concentration <= c_high:
            return ((aqi_high - aqi_low) / (c_high - c_low)) * (concentration - c_low) + aqi_low
    return 500

def calculate_aqi_accurate(pm25, pm10, no2, so2, co, o3):
    """Calculate AQI using proper EPA breakpoints."""
    pm25_bp = [(0.0, 12.0, 0, 50), (12.1, 35.4, 51, 100), (35.5, 55.4, 101, 150),
               (55.5, 150.4, 151, 200), (150.5, 250.4, 201, 300), (250.5, 500.4, 301, 500)]
    pm10_bp = [(0, 54, 0, 50), (55, 154, 51, 100), (155, 254, 101, 150),
               (255, 354, 151, 200), (355, 424, 201, 300), (425, 604, 301, 500)]
    no2_bp = [(0, 53, 0, 50), (54, 100, 51, 100), (101, 360, 101, 150),
              (361, 649, 151, 200), (650, 1249, 201, 300), (1250, 2049, 301, 500)]
    so2_bp = [(0, 35, 0, 50), (36, 75, 51, 100), (76, 185, 101, 150),
              (186, 304, 151, 200), (305, 604, 201, 300), (605, 1004, 301, 500)]
    o3_bp = [(0, 54, 0, 50), (55, 70, 51, 100), (71, 85, 101, 150),
             (86, 105, 151, 200), (106, 200, 201, 300), (201, 504, 301, 500)]
    co_bp = [(0.0, 4.4, 0, 50), (4.5, 9.4, 51, 100), (9.5, 12.4, 101, 150),
             (12.5, 15.4, 151, 200), (15.5, 30.4, 201, 300), (30.5, 50.4, 301, 500)]
    
    aqi_values = []
    for i in range(len(pm25)):
        sub_aqis = [
            calculate_sub_aqi(pm25[i], pm25_bp),
            calculate_sub_aqi(pm10[i], pm10_bp),
            calculate_sub_aqi(no2[i], no2_bp),
            calculate_sub_aqi(so2[i], so2_bp),
            calculate_sub_aqi(co[i], co_bp),
            calculate_sub_aqi(o3[i], o3_bp),
        ]
        aqi_values.append(max(sub_aqis))
    return np.array(aqi_values)

def generate_realistic_data(n_samples=20000):
    """Generate realistic synthetic data with correlated pollutants."""
    np.random.seed(42)
    
    rush_hour = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
    industrial = np.random.choice([0, 1], n_samples, p=[0.8, 0.2])
    traffic = np.random.uniform(0.5, 2.0, n_samples)
    
    pm25_base = np.random.gamma(3, 15, n_samples)
    pm25 = pm25_base * (1 + 0.5 * rush_hour + 0.8 * industrial) * traffic
    pm25 = np.clip(pm25, 0, 500)
    
    pm10 = pm25 * np.random.uniform(1.2, 2.5, n_samples) + np.random.normal(0, 10, n_samples)
    pm10 = np.clip(pm10, 0, 600)
    
    no2_base = np.random.gamma(2, 20, n_samples)
    no2 = no2_base * (1 + rush_hour * 0.7) * traffic
    no2 = np.clip(no2, 0, 200)
    
    so2_base = np.random.exponential(15, n_samples)
    so2 = so2_base * (1 + industrial * 1.5)
    so2 = np.clip(so2, 0, 200)
    
    co_base = np.random.gamma(1.5, 1, n_samples)
    co = co_base * (1 + rush_hour * 0.5) * traffic
    co = np.clip(co, 0, 20)
    
    o3_base = np.random.gamma(2, 25, n_samples)
    o3 = o3_base * (1 - 0.3 * (no2 / 200)) + np.random.normal(0, 5, n_samples)
    o3 = np.clip(o3, 0, 200)
    
    aqi = calculate_aqi_accurate(pm25, pm10, no2, so2, co, o3)
    
    df = pd.DataFrame({
        'PM2.5': pm25, 'PM10': pm10, 'NO2': no2, 'SO2': so2, 'CO': co, 'O3': o3,
        'PM_ratio': pm25 / (pm10 + 1),
        'PM_total': pm25 + pm10,
        'NOx_O3_ratio': no2 / (o3 + 1),
        'Industrial_indicator': so2 * co,
        'Traffic_indicator': no2 * co,
        'AQI': aqi
    })
    return df

def train_improved():
    print("=" * 50)
    print("Training Improved AQI Model")
    print("=" * 50)
    
    print("\n1. Generating data...")
    df = generate_realistic_data(n_samples=20000)
    print(f"   Samples: {len(df)}, AQI: {df['AQI'].min():.0f}-{df['AQI'].max():.0f}")
    
    feature_cols = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 
                    'PM_ratio', 'PM_total', 'NOx_O3_ratio', 
                    'Industrial_indicator', 'Traffic_indicator']
    
    X = df[feature_cols]
    y = df['AQI']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"   Train: {len(X_train)}, Test: {len(X_test)}")
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("\n2. Training ensemble...")
    
    rf = RandomForestRegressor(n_estimators=200, max_depth=15, min_samples_split=5, 
                               min_samples_leaf=2, random_state=42, n_jobs=-1)
    gb = GradientBoostingRegressor(n_estimators=200, max_depth=8, learning_rate=0.1,
                                   min_samples_split=5, random_state=42)
    
    stacking_model = StackingRegressor(
        estimators=[('rf', rf), ('gb', gb)],
        final_estimator=Ridge(alpha=1.0),
        cv=5, n_jobs=-1
    )
    stacking_model.fit(X_train_scaled, y_train)
    
    print("\n3. Evaluation:")
    y_pred = stacking_model.predict(X_test_scaled)
    print(f"   MAE: {mean_absolute_error(y_test, y_pred):.2f}")
    print(f"   R²:  {r2_score(y_test, y_pred):.4f}")
    
    print("\n4. Saving model...")
    improved_model = ImprovedAQIModel(stacking_model, scaler)
    joblib.dump(improved_model, 'backend/ml/aqi_model.joblib')
    print("   Saved to backend/ml/aqi_model.joblib")
    print("\n" + "=" * 50)

if __name__ == "__main__":
    train_improved()
