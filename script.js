
const apiKey = "78334401470eaad02d1c9ab72935b0f3";

const currentURL  = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
const aqiURL      = "https://api.openweathermap.org/data/2.5/air_pollution?";


const searchBox       = document.querySelector(".search input");
const searchBtn       = document.getElementById("searchBtn");
const locationBtn     = document.getElementById("locationBtn");
const weatherIcon     = document.querySelector(".weather-icon");
const suggestionsBox  = document.querySelector(".suggestions");
const loadingOverlay  = document.getElementById("loadingOverlay");
const themeToggle     = document.getElementById("themeToggle");
const themeIcon       = document.getElementById("themeIcon");
const addFavBtn       = document.getElementById("addFavBtn");
const favList         = document.getElementById("favList");
const hourlyContainer = document.getElementById("hourlyContainer");
const aqiBar          = document.getElementById("aqiBar");
const aqiLabel        = document.getElementById("aqiLabel");
const weatherTip      = document.getElementById("weatherTip");
const tipText         = document.getElementById("tipText");
const particlesDiv    = document.getElementById("particles");


function showLoading() {
  loadingOverlay.classList.add("active");
}


function hideLoading() {
  loadingOverlay.classList.remove("active");
}


let currentTheme = localStorage.getItem("skyCastTheme") || "dark";


document.documentElement.setAttribute("data-theme", currentTheme);
updateThemeIcon();


themeToggle.addEventListener("click", () => {
  currentTheme = (currentTheme === "dark") ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("skyCastTheme", currentTheme);
  updateThemeIcon();
});


function updateThemeIcon() {
  themeIcon.className = (currentTheme === "dark") ? "fa fa-moon" : "fa fa-sun";
}


const weatherBgMap = {
  "clear":        "weather-clear",
  "clouds":       "weather-clouds",
  "rain":         "weather-rain",
  "drizzle":      "weather-drizzle",
  "snow":         "weather-snow",
  "thunderstorm": "weather-thunderstorm",
  "mist":         "weather-mist",
  "fog":          "weather-fog",
  "haze":         "weather-haze"
};


function setWeatherBackground(condition) {
  const key   = condition.toLowerCase();
  const cls   = weatherBgMap[key] || "";

  
  Object.values(weatherBgMap).forEach(c => document.body.classList.remove(c));

  if (cls) document.body.classList.add(cls);
}


function createParticles() {
  particlesDiv.innerHTML = "";
  const count = 18; 

  for (let i = 0; i < count; i++) {
    const p    = document.createElement("div");
    p.className = "particle";

    const size     = Math.random() * 6 + 3;    
    const left     = Math.random() * 100;       
    const duration = Math.random() * 14 + 8;    
    const delay    = Math.random() * -20;        

    p.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      left:   ${left}%;
      bottom: -10px;
      animation-duration: ${duration}s;
      animation-delay:    ${delay}s;
    `;

    particlesDiv.appendChild(p);
  }
}


createParticles();


function getWeatherTip(condition, temp) {
  const c = condition.toLowerCase();

  if (c.includes("rain") || c.includes("drizzle"))
    return "🌧️ It's raining – don't forget your umbrella before heading out!";

  if (c.includes("thunderstorm"))
    return "⛈️ Thunderstorm alert! Stay indoors and avoid open areas.";

  if (c.includes("snow"))
    return "❄️ Snow expected – wear warm layers and drive carefully.";

  if (c.includes("clear") && temp > 30)
    return "☀️ It's hot and sunny – stay hydrated and apply sunscreen!";

  if (c.includes("clear") && temp < 10)
    return "🌤️ Clear but cold – bundle up before going outside.";

  if (c.includes("clear"))
    return "😎 Beautiful clear sky – a great day for outdoor activities!";

  if (c.includes("clouds"))
    return "🌥️ Mostly cloudy today – a light jacket could come in handy.";

  if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
    return "🌫️ Low visibility due to fog/mist – drive carefully and use headlights.";

  return "🌍 Stay weather-aware and check back for updates!";
}


function formatTime(unixTimestamp, timezoneOffset) {

  const localMs  = (unixTimestamp + timezoneOffset) * 1000;
  const date     = new Date(localMs);
 
  let   hours    = date.getUTCHours();
  const minutes  = date.getUTCMinutes().toString().padStart(2, "0");
  const ampm     = hours >= 12 ? "PM" : "AM";
  hours          = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}
const aqiInfo = [
  { label: "Good",        color: "#00e676", pct: 20  },
  { label: "Fair",        color: "#ffee58", pct: 40  },
  { label: "Moderate",    color: "#ffa726", pct: 60  },
  { label: "Poor",        color: "#ef5350", pct: 80  },
  { label: "Very Poor",   color: "#b71c1c", pct: 100 }
];

async function getAQI(lat, lon) {
  try {
    const response = await fetch(`${aqiURL}lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const data     = await response.json();
    const aqi    = data.list[0].main.aqi;
    const info   = aqiInfo[aqi - 1];

    
    aqiBar.style.width      = info.pct + "%";
    aqiBar.style.background = info.color;
    aqiLabel.textContent    = `AQI ${aqi} – ${info.label}`;
    aqiLabel.style.color    = info.color;

  } catch (err) {
    
    aqiLabel.textContent = "AQI data unavailable";
  }
}


async function getWeather(city) {
  showLoading();

  const response = await fetch(currentURL + city + "&appid=" + apiKey);

  if (response.status === 404) {
    
    document.querySelector(".error").style.display   = "block";
    document.querySelector(".weather").style.display = "none";
    hideLoading();
    return;
  }

  const data = await response.json();


  document.querySelector(".city").innerHTML = data.name;
  document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
  document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
  document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";


  const iconCode  = data.weather[0].icon;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;


 
  document.querySelector(".weather-desc").textContent = data.weather[0].description;

  
  document.querySelector(".feels-like").textContent =
    Math.round(data.main.feels_like) + "°C";

  
  const tz = data.timezone; 
  document.querySelector(".sunrise").textContent =
    formatTime(data.sys.sunrise, tz);
  document.querySelector(".sunset").textContent =
    formatTime(data.sys.sunset, tz);

  
  const condition = data.weather[0].main;
  setWeatherBackground(condition);

  tipText.textContent = getWeatherTip(condition, data.main.temp);

 
  getAQI(data.coord.lat, data.coord.lon);

 
  document.querySelector(".weather").style.display = "block";
  document.querySelector(".error").style.display   = "none";

  
  getForecast(city);

 
  lastCity = data.name;

  hideLoading();
}
async function getForecast(city) {
  const response = await fetch(forecastURL + city + "&appid=" + apiKey);
  const data     = await response.json();
  hourlyContainer.innerHTML = "";
  const hourlySlices = data.list.slice(0, 8); 

  hourlySlices.forEach(item => {
    const date     = new Date(item.dt_txt);
    const hour     = date.toLocaleTimeString("en-US", {
      hour: "numeric", hour12: true
    });
    const temp     = Math.round(item.main.temp);
    const icon     = item.weather[0].icon;

    hourlyContainer.innerHTML += `
      <div class="hourly-item">
        <p>${hour}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="">
        <p class="hour-temp">${temp}°C</p>
      </div>
    `;
  });

  
  const forecastContainer = document.querySelector(".forecast-container");
  forecastContainer.innerHTML = "";

  for (let i = 0; i < data.list.length; i += 8) {
    const item = data.list[i];
    const date = new Date(item.dt_txt);
    const day  = date.toLocaleDateString("en-US", { weekday: "short" });
    const temp = Math.round(item.main.temp);
    const icon = item.weather[0].icon;

    forecastContainer.innerHTML += `
      <div class="forecast-day">
        <p>${day}</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="">
        <p>${temp}°C</p>
      </div>
    `;
  }
}


async function getCitySuggestions(city) {
  if (city.length < 2) {
    suggestionsBox.style.display = "none";
    return;
  }

  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`
  );
  const data = await response.json();

  suggestionsBox.innerHTML = "";

  data.forEach(place => {
    const li = document.createElement("li");
    li.innerText = `${place.name}, ${place.country}`;

    li.addEventListener("click", () => {
      searchBox.value              = place.name;
      suggestionsBox.style.display = "none";
      getWeather(place.name);
    });

    suggestionsBox.appendChild(li);
  });

  suggestionsBox.style.display = "block";
}


let lastCity = "";


function loadFavorites() {
  return JSON.parse(localStorage.getItem("skyCastFavorites") || "[]");
}


function saveFavorites(arr) {
  localStorage.setItem("skyCastFavorites", JSON.stringify(arr));
}

function renderFavorites() {
  const favs = loadFavorites();
  favList.innerHTML = "";

  if (favs.length === 0) {
    favList.innerHTML = `<span style="font-size:0.8rem;color:var(--text-muted)">No saved cities yet.</span>`;
    return;
  }

  favs.forEach(city => {
    const chip = document.createElement("div");
    chip.className = "fav-chip";

    const citySpan = document.createElement("span");
    citySpan.textContent = city;
    citySpan.addEventListener("click", () => getWeather(city));

    
    const removeBtn = document.createElement("button");
    removeBtn.className = "fav-chip-remove";
    removeBtn.title     = "Remove";
    removeBtn.innerHTML = '<i class="fa fa-xmark"></i>';

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();                        
      const updated = loadFavorites().filter(c => c !== city);
      saveFavorites(updated);
      renderFavorites();
    });

    chip.appendChild(citySpan);
    chip.appendChild(removeBtn);
    favList.appendChild(chip);
  });
}


addFavBtn.addEventListener("click", () => {
  if (!lastCity) return;

  const favs = loadFavorites();
  if (!favs.includes(lastCity)) {
    favs.push(lastCity);
    saveFavorites(favs);
    renderFavorites();
  }
});


renderFavorites();


searchBox.addEventListener("input", () => {
  getCitySuggestions(searchBox.value);
});


searchBtn.addEventListener("click", () => {
  getWeather(searchBox.value);
});


searchBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getWeather(searchBox.value);
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const data = await response.json();

    document.querySelector(".city").innerHTML     = data.name;
    document.querySelector(".temp").innerHTML     = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML     = data.wind.speed + " km/h";
    document.querySelector(".weather-desc").textContent = data.weather[0].description;
    document.querySelector(".feels-like").textContent   =
      Math.round(data.main.feels_like) + "°C";

    const tz = data.timezone;
    document.querySelector(".sunrise").textContent =
      formatTime(data.sys.sunrise, tz);
    document.querySelector(".sunset").textContent =
      formatTime(data.sys.sunset,  tz);

    const iconCode  = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    const condition = data.weather[0].main;
    setWeatherBackground(condition);

    tipText.textContent = getWeatherTip(condition, data.main.temp);

    getAQI(lat, lon);

    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display   = "none";

    lastCity = data.name;

    getForecast(data.name);
    hideLoading();

  }, () => {
   
    hideLoading();
    alert("Unable to retrieve your location.");
  });
});
