import os
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "http://api.openweathermap.org/data/2.5/forecast"


def get_weather(city=None, lat=None, lon=None):
    if not API_KEY:
        return {"error": "API key is not configured"}

    params = {
        "appid": API_KEY,
        "units": "metric",
        "cnt": 40  # 40 timestamps cover 5 days
    }
    if city:
        params["q"] = city
    elif lat and lon:
        params["lat"] = lat
        params["lon"] = lon

    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        weather_data = response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"API request failed: {e}"}

    if "list" not in weather_data or not weather_data["list"]:
        return {"error": "City not found or API issue"}

    # Process hourly forecast for the next 24 hours (8 timestamps)
    hourly_forecasts = []
    for item in weather_data.get("list", [])[:8]:
        hourly_forecasts.append({
            # Use a cross-platform way to format the hour without zero-padding
            "time": f"{int(datetime.fromtimestamp(item['dt']).strftime('%I'))} {datetime.fromtimestamp(item['dt']).strftime('%p')}",
            "temp": item["main"]["temp"],
            "icon": item["weather"][0]["icon"]
        })

    # Process the 3-hour data to get a 5-day summary
    daily_forecasts = {}
    for forecast_item in weather_data.get("list", []):
        dt_object = datetime.fromisoformat(
            forecast_item["dt_txt"].split(" ")[0])
        day_date = dt_object.strftime('%Y-%m-%d')

        if day_date not in daily_forecasts:
            daily_forecasts[day_date] = {
                "day": datetime.fromisoformat(day_date).strftime('%A'),
                "temps": [],
                "rain_chances": [],
                "weather_details": {}
            }
        daily_forecasts[day_date]["temps"].append(
            forecast_item["main"]["temp"])
        daily_forecasts[day_date]["rain_chances"].append(
            forecast_item.get("pop", 0))
        weather_desc = forecast_item["weather"][0]["description"]
        weather_icon = forecast_item["weather"][0]["icon"]
        # Store count and icon for each weather description
        if weather_desc not in daily_forecasts[day_date]["weather_details"]:
            daily_forecasts[day_date]["weather_details"][weather_desc] = {
                "count": 0, "icon": weather_icon}
        daily_forecasts[day_date]["weather_details"][weather_desc]["count"] += 1

    # Consolidate daily data
    final_forecasts = []
    for data in daily_forecasts.values():
        most_common_weather = max(
            data["weather_details"], key=lambda k: data["weather_details"][k]["count"])
        final_forecasts.append({
            "day": data["day"], "temp_max": max(data["temps"]), "temp_min": min(data["temps"]),
            "rain_chance": max(data["rain_chances"]) * 100,
            "weather": most_common_weather,
            "icon": data["weather_details"][most_common_weather]["icon"]
        })

    return {
        "city": weather_data["city"]["name"],
        "hourly": hourly_forecasts,
        # Return up to 6 days, including today
        "forecasts": final_forecasts[:6]
    }
