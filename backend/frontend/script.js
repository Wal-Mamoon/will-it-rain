async function getForecast() {
    let city = document.getElementById("city").value;
    let response = await fetch(`http://127.0.0.1:5000/forecast?city=${city}`);
    let data = await response.json();

    if (data.error) {
        document.getElementById("result").innerHTML = `<p>❌ ${data.error}</p>`;
    } else {
        document.getElementById("result").innerHTML = `
      <p>📍 City: ${data.city}</p>
      <p>🌡️ Temp: ${data.temperature}°C</p>
      <p>🌦️ Rain Chance: ${data.rain_chance}%</p>
      <p>☁️ Condition: ${data.weather}</p>
      <h2>${data.rain_chance > 50 ? "🚨 Better bring an umbrella!" : "🎉 You're good to go!"}</h2>
    `;
    }
}
