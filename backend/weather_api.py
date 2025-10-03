import requests

API_KEY = "37c6b9e1ea40aa67195acd985e4b8846"
BASE_URL = "http://api.openweathermap.org/data/2.5/forecast"


def get_weather(city):
    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }
    response = requests.get(BASE_URL, params=params).json()

    if "list" not in response:
        return {"error": "City not found or API issue"}

    # Get next forecast (3-hour intervals)
    next_forecast = response["list"][0]
    return {
        "city": response["city"]["name"],
        "temperature": next_forecast["main"]["temp"],
        # probability of precipitation
        "rain_chance": next_forecast.get("pop", 0) * 100,
        "weather": next_forecast["weather"][0]["description"]
    }
