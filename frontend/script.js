async function getForecast() {
    let city = document.getElementById("city").value;
    let response = await fetch(`/forecast?city=${city}`);
    let data = await response.json();

    if (data.error) {
        document.getElementById("result").innerHTML = `<p>❌ ${data.error}</p>`;
    } else {
        let resultHtml = `<h2>Weather for ${data.city}</h2><div class="forecast-container">`;
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
        resultHtml += `</div>`; // Close the forecast-container
        resultHtml += `<h2>${bringUmbrella ? "🚨 Better bring an umbrella!" : "🎉 You're good to go!"}</h2>`;
        document.getElementById("result").innerHTML = resultHtml;
    }
}
