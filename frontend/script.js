const forecastButton = document.getElementById("forecast-button");
const locationButton = document.getElementById("location-button");
const cityInput = document.getElementById("city");
const resultDiv = document.getElementById("result");
const loader = document.getElementById("loader");

function getForecastByCity() {
    const city = cityInput.value;
    if (!city) {
        resultDiv.innerHTML = `<p>❌ Please enter a city.</p>`;
        return;
    }
    fetchForecast(`/forecast?city=${city}`);
}

function getForecastByLocation() {
    if (!navigator.geolocation) {
        resultDiv.innerHTML = `<p>❌ Geolocation is not supported by your browser.</p>`;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchForecast(`/forecast?lat=${latitude}&lon=${longitude}`);
        },
        () => {
            resultDiv.innerHTML = `<p>❌ Unable to retrieve your location. Please grant permission.</p>`;
        }
    );
}

async function fetchForecast(url) {
    // Start loading state
    loader.style.display = "block";
    resultDiv.innerHTML = "";
    forecastButton.disabled = true;
    locationButton.disabled = true;

    try {
        const response = await fetch(url);
        const data = await response.json();
        renderForecast(data);
    } catch (error) {
        resultDiv.innerHTML = `<p>❌ An unexpected error occurred. Please try again.</p>`;
    } finally {
        // End loading state
        loader.style.display = "none";
        forecastButton.disabled = false;
        locationButton.disabled = false;
    }
}

function renderForecast(data) {
    if (data.error) {
        resultDiv.innerHTML = `<p>❌ ${data.error}</p>`;
        return;
    }

    let resultHtml = `<h2>Weather for ${data.city}</h2>`;

    // Render hourly forecast
    resultHtml += `<h3>Next 24 Hours</h3><div class="hourly-forecast-container">`;
    data.hourly.forEach(hour => {
        const iconUrl = `http://openweathermap.org/img/wn/${hour.icon}.png`;
        resultHtml += `
            <div class="hourly-item">
                <p><strong>${hour.time}</strong></p>
                <img src="${iconUrl}" alt="Weather icon">
                <p>${hour.temp.toFixed(0)}°C</p>
            </div>
        `;
    });
    resultHtml += `</div>`;

    // Render daily forecast
    resultHtml += `<h3>Next 5 Days</h3><div class="forecast-container">`;
    let bringUmbrella = false;
    data.forecasts.forEach(forecast => {
        const iconUrl = `http://openweathermap.org/img/wn/${forecast.icon}@2x.png`;
        resultHtml += `
            <div class="forecast-item">
                <p><strong>${forecast.day}</strong></p>
                <img src="${iconUrl}" alt="${forecast.weather}" class="weather-icon">
                <p>🔼 High: ${forecast.temp_max.toFixed(1)}°C</p>
                <p>🔽 Low: ${forecast.temp_min.toFixed(1)}°C</p>
                <p>🌦️ Rain: ${forecast.rain_chance.toFixed(0)}%</p>
            </div>
        `;
        if (forecast.rain_chance > 50) {
            bringUmbrella = true;
        }
    });
    resultHtml += `</div>`;

    // Render umbrella message
    resultHtml += `<h2>${bringUmbrella ? "🚨 Better bring an umbrella!" : "🎉 You're good to go!"}</h2>`;

    resultDiv.innerHTML = resultHtml;
}
