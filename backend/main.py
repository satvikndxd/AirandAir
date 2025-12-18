from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import random
import joblib
import numpy as np
import pandas as pd
import os
import httpx

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAQ API base URL
OPENAQ_API = "https://api.openaq.org/v2"

# Import the model wrapper class (needed for unpickling)
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ml'))
from model_wrapper import ImprovedAQIModel

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml', 'aqi_model.joblib')
try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

def get_health_risk(aqi):
    if aqi <= 50:
        return "Good", "green"
    elif aqi <= 100:
        return "Moderate", "yellow"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups", "orange"
    elif aqi <= 200:
        return "Unhealthy", "red"
    elif aqi <= 300:
        return "Very Unhealthy", "purple"
    else:
        return "Hazardous", "maroon"

def calculate_aqi_from_pm25(pm25):
    """Calculate US AQI from PM2.5 concentration"""
    if pm25 <= 12.0:
        return ((50 - 0) / (12.0 - 0)) * (pm25 - 0) + 0
    elif pm25 <= 35.4:
        return ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51
    elif pm25 <= 55.4:
        return ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101
    elif pm25 <= 150.4:
        return ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151
    elif pm25 <= 250.4:
        return ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201
    else:
        return ((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301

@app.get("/api/search/{query}")
async def search_places(query: str):
    """Search for places using OpenStreetMap Nominatim API"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": query,
                    "format": "json",
                    "limit": 5,
                    "addressdetails": 1
                },
                headers={
                    "User-Agent": "AirZen-AQI-App/1.0"
                }
            )
            
            data = response.json()
            results = []
            
            for place in data:
                results.append({
                    "name": place.get("display_name", ""),
                    "lat": float(place.get("lat", 0)),
                    "lng": float(place.get("lon", 0)),
                    "type": place.get("type", ""),
                    "country": place.get("address", {}).get("country", "")
                })
            
            return {"success": True, "results": results}
            
    except Exception as e:
        print(f"Geocoding error: {e}")
        return {"success": False, "error": str(e), "results": []}

@app.get("/api/aqi/{lat}/{lng}")
async def get_real_aqi(lat: float, lng: float):
    """Fetch real AQI data from Open-Meteo Air Quality API (free, no token required)"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Open-Meteo Air Quality API - completely free, accurate location data
            response = await client.get(
                "https://air-quality-api.open-meteo.com/v1/air-quality",
                params={
                    "latitude": lat,
                    "longitude": lng,
                    "current": "us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
                    "hourly": "us_aqi",
                    "forecast_days": 1,
                    "timezone": "auto"
                }
            )
            
            data = response.json()
            
            if "current" in data:
                current = data["current"]
                aqi = current.get("us_aqi", 50)
                
                # Extract pollutants
                pollutants = {}
                if current.get("pm2_5") is not None:
                    pollutants["PM2.5"] = round(current["pm2_5"], 1)
                if current.get("pm10") is not None:
                    pollutants["PM10"] = round(current["pm10"], 1)
                if current.get("nitrogen_dioxide") is not None:
                    pollutants["NO₂"] = round(current["nitrogen_dioxide"], 1)
                if current.get("ozone") is not None:
                    pollutants["O₃"] = round(current["ozone"], 1)
                if current.get("sulphur_dioxide") is not None:
                    pollutants["SO₂"] = round(current["sulphur_dioxide"], 1)
                if current.get("carbon_monoxide") is not None:
                    pollutants["CO"] = round(current["carbon_monoxide"] / 1000, 2)  # Convert to mg/m³
                
                risk_level, color = get_health_risk(aqi)
                
                # Get pollutant values for ML
                pm25_val = pollutants.get("PM2.5", 30)
                pm10_val = pollutants.get("PM10", pm25_val * 1.5)
                no2_val = pollutants.get("NO₂", 20)
                so2_val = pollutants.get("SO₂", 10)
                co_val = pollutants.get("CO", 0.5)
                o3_val = pollutants.get("O₃", 30)
                
                # Generate hourly forecast from API data
                forecast = []
                api_forecast = []
                if "hourly" in data and "us_aqi" in data["hourly"]:
                    hourly_aqi = data["hourly"]["us_aqi"]
                    hourly_time = data["hourly"]["time"]
                    
                    # Find current hour index and get next 6 hours
                    current_hour = pd.Timestamp.now().hour
                    for i in range(current_hour + 1, min(current_hour + 7, len(hourly_aqi))):
                        if hourly_aqi[i] is not None:
                            hour_str = pd.Timestamp(hourly_time[i]).strftime("%I %p")
                            api_forecast.append({
                                "hour": hour_str,
                                "aqi": round(hourly_aqi[i]),
                                "source": "satellite"
                            })
                
                # ML Forecast: Predict next 3 hours using trend analysis
                ml_forecast = []
                if model and pollutants:
                    try:
                        # Simulate pollutant trends for next 3 hours
                        # Typical patterns: PM increases in evening, decreases at night
                        hour_now = pd.Timestamp.now().hour
                        
                        for h in range(1, 4):  # Next 1, 2, 3 hours
                            future_hour = (hour_now + h) % 24
                            
                            # Apply time-based modifiers (rush hours, night reduction)
                            if 7 <= future_hour <= 10 or 17 <= future_hour <= 20:
                                # Rush hours - pollution tends to increase
                                modifier = 1.0 + (0.05 * h)
                            elif 0 <= future_hour <= 5:
                                # Night - pollution tends to decrease
                                modifier = 1.0 - (0.03 * h)
                            else:
                                modifier = 1.0
                            
                            # Predict with modified pollutants
                            input_df = pd.DataFrame([{
                                'PM2.5': pm25_val * modifier,
                                'PM10': pm10_val * modifier,
                                'NO2': no2_val * modifier,
                                'SO2': so2_val,
                                'CO': co_val * modifier,
                                'O3': o3_val * (2 - modifier)  # O3 inversely correlated
                            }])
                            
                            predicted_aqi = max(0, model.predict(input_df)[0])
                            hour_str = pd.Timestamp.now().replace(hour=future_hour).strftime("%I %p")
                            
                            ml_forecast.append({
                                "hour": hour_str,
                                "aqi": round(predicted_aqi),
                                "source": "ml"
                            })
                    except Exception as e:
                        print(f"ML forecast error: {e}")
                
                # Combine forecasts - use API forecast (more accurate), ML fills gaps
                forecast = api_forecast if api_forecast else ml_forecast
                
                return {
                    "success": True,
                    "location": {
                        "name": f"{lat:.2f}°N, {abs(lng):.2f}°{'E' if lng >= 0 else 'W'}",
                        "lat": lat,
                        "lng": lng
                    },
                    "aqi": aqi,
                    "ml_forecast": ml_forecast,  # ML-based forecast for next 3 hours
                    "risk_level": risk_level,
                    "color": color,
                    "pollutants": pollutants,
                    "forecast": forecast,  # API-based forecast
                    "source": "Open-Meteo Live",
                    "timestamp": pd.Timestamp.now().isoformat(),
                    "last_updated": pd.Timestamp.now().strftime("%H:%M:%S")
                }
            else:
                raise Exception("No current data in API response")
                
    except Exception as e:
        print(f"Open-Meteo API error: {e}")
        simulated_aqi = random.uniform(40, 120)
        risk_level, color = get_health_risk(simulated_aqi)
        return {
            "success": False,
            "error": str(e),
            "aqi": round(simulated_aqi, 1),
            "risk_level": risk_level,
            "color": color,
            "pollutants": {"PM2.5": round(random.uniform(20, 80), 1)},
            "source": "Estimated (API error)",
            "last_updated": pd.Timestamp.now().strftime("%H:%M:%S")
        }

async def generate_sensor_data():
    """Simulates reading from sensors."""
    return {
        'PM2.5': random.uniform(5, 300),
        'PM10': random.uniform(10, 400),
        'NO2': random.uniform(5, 200),
        'SO2': random.uniform(5, 200),
        'CO': random.uniform(0.1, 20),
        'O3': random.uniform(5, 200),
    }

@app.websocket("/ws/aqi")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await generate_sensor_data()
            
            if model:
                input_df = pd.DataFrame([data])
                input_df = input_df[['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3']]
                predicted_aqi = model.predict(input_df)[0]
                predicted_aqi = max(0, predicted_aqi)
            else:
                predicted_aqi = 0
            
            risk_level, color = get_health_risk(predicted_aqi)

            current_date = pd.Timestamp.now()
            forecast = []
            for i in range(1, 4):
                future_date = current_date + pd.Timedelta(days=i)
                day_name = future_date.day_name()
                f_aqi = max(0, predicted_aqi + random.uniform(-50, 50))
                f_risk, _ = get_health_risk(f_aqi)
                condition = "Sunny" if f_aqi < 50 else "Cloudy" if f_aqi < 100 else "Rainy"
                forecast.append({
                    "day": day_name,
                    "aqi": int(f_aqi),
                    "risk": f_risk,
                    "condition": condition
                })
            
            response = {
                "pollutants": data,
                "aqi": round(predicted_aqi, 2),
                "risk_level": risk_level,
                "color": color,
                "timestamp": current_date.isoformat(),
                "forecast": forecast
            }
            
            await websocket.send_text(json.dumps(response))
            await asyncio.sleep(2)
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

@app.get("/")
def read_root():
    return {"message": "Air Quality Prediction API is running"}
