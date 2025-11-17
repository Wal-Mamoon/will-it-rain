import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from weather_api import get_weather
from whitenoise import WhiteNoise

# Construct the absolute path to the frontend folder
static_folder_path = os.path.join(os.path.dirname(__file__), '..', 'frontend')

app = Flask(__name__, static_folder=static_folder_path)
CORS(app)

# Use WhiteNoise to serve static files in production
app.wsgi_app = WhiteNoise(
    app.wsgi_app, root=static_folder_path, index_file=True)

# Forecast API


@app.route("/forecast", methods=["GET"])
def forecast():
    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if city:
        weather_data = get_weather(city=city)
    elif lat and lon:
        weather_data = get_weather(lat=lat, lon=lon)
    else:
        return jsonify({"error": "City or coordinates are required"}), 400
    return jsonify(weather_data)


if __name__ == "__main__":
    app.run(debug=True)
