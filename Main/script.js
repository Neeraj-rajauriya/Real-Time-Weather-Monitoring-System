const weather = {
  apiKey: "47f3068f46dad257550d26c24503ddc0", // Replace with your actual API key
  unit: "metric", // Default to Celsius
  alertThreshold: 35, // Default threshold for alerts
  consecutiveAlertCount: 0, // Counter for consecutive alerts

  fetchWeather: function () {
    const city = document.querySelector(".search-bar").value; // Get the city from the input field
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=${this.unit}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("City not found");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data); // Log the weather data
        this.displayWeather(data);
      })
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  },

  displayWeather: function (data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, feels_like, humidity } = data.main;
    const { speed } = data.wind;

    const weatherInfoDiv = document.querySelector(".weather-info");
    weatherInfoDiv.innerHTML = `
      <h2 class="city">Weather in ${name}</h2>
      <img src="https://openweathermap.org/img/wn/${icon}.png" class="icon">
      <div class="temp-container">
        <h1 class="temp">${this.convertTemp(temp)}°${this.getUnitSymbol()}</h1>
        <h3 class="temp-feels-like">Feels like: ${this.convertTemp(feels_like)}°${this.getUnitSymbol()}</h3>
      </div>
      <div class="additional-info">
        <div class="description">${description}</div>
        <p class="datetime">Last updated: ${new Date().toLocaleString()}</p>
        <p>Humidity: ${humidity}% | Wind speed: ${speed} km/h</p>
      </div>
    `;

    this.checkConsecutiveAlerts(temp); // Check for consecutive alert condition
    this.fetchForecast(name); // Fetch forecast based on city name
  },

  fetchForecast: function (city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.apiKey}&units=${this.unit}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Forecast not found");
        }
        return response.json();
      })
      .then((data) => this.displayForecast(data))
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  },

  displayForecast: function (data) {
    const forecastContainer = document.querySelector(".forecast-container");
    forecastContainer.innerHTML = ""; // Clear previous forecast
    const forecastList = data.list;

    const dailyForecasts = new Map();
    forecastList.forEach((forecast) => {
      const date = forecast.dt_txt.split(" ")[0];
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, forecast);
      }
    });

    dailyForecasts.forEach((forecast) => {
      const forecastItem = document.createElement("div");
      forecastItem.classList.add("forecast-item");

      forecastItem.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" class="forecast-icon">
        <div class="forecast-temp">${this.convertTemp(forecast.main.temp)}°${this.getUnitSymbol()}</div>
        <div class="forecast-date">${forecast.dt_txt.split(" ")[0]}</div>
      `;

      forecastContainer.appendChild(forecastItem);
    });
  },

  convertTemp: function (temp) {
    if (this.unit === "metric") {
      return temp.toFixed(1); // Celsius
    } else if (this.unit === "imperial") {
      return ((temp * 9) / 5 + 32).toFixed(1); // Fahrenheit
    }
    return (temp + 273.15).toFixed(1); // Kelvin
  },

  getUnitSymbol: function () {
    if (this.unit === "metric") return "C";
    else if (this.unit === "imperial") return "F";
    return "K";
  },

  changeUnit: function () {
    const selectedUnit = document.getElementById("degree").value;
    this.unit = selectedUnit === "C" ? "metric" : selectedUnit === "F" ? "imperial" : "standard";
  },

  checkConsecutiveAlerts: function (currentTemperature) {
    const thresholdInput = document.getElementById('threshold-input');
    const threshold = Number(thresholdInput.value) || this.alertThreshold; // Get user-defined threshold or default

    if (currentTemperature > threshold) {
      this.consecutiveAlertCount++;
      if (this.consecutiveAlertCount === 2) { // Alert on second consecutive exceeding
        alert(`⚠️ Alert: Temperature has exceeded ${threshold}°C for two consecutive updates!`);
        this.consecutiveAlertCount = 0; // Reset counter after alert
      }
    } else {
      this.consecutiveAlertCount = 0; // Reset counter if temperature is below threshold
    }
  },
};

// Event listener for search button
document.getElementById("search-btn").addEventListener("click", () => {
  weather.fetchWeather();
});

// Event listener for unit change
document.getElementById("degree").addEventListener("change", () => {
  weather.changeUnit();
  weather.fetchWeather(); // Re-fetch weather with new unit
});

// Optional: Add an event listener for pressing "Enter" in the search bar
document.querySelector(".search-bar").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    weather.fetchWeather();
  }
});

// Event listener for threshold input changes
document.getElementById('threshold-input').addEventListener('input', () => {
  const currentTemperature = document.querySelector('.temp').textContent.split('°')[0]; // Get current temperature
  weather.checkConsecutiveAlerts(Number(currentTemperature));
});


