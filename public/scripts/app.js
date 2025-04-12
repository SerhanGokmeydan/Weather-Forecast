//map
const geolocation = window.navigator.geolocation;
const map = L.map("map");
let marker;

const weatherButton = document.querySelector("#weather-button");
const mapButton = document.querySelector("#map-button");

const dropdownMenus = document.querySelectorAll(".dropdown-menu");
const dropdownContents = document.querySelectorAll(".dropdown-content");
const dropdownLists = document.querySelectorAll(".dropdown-list");
const dropdownInputs = document.querySelectorAll(".selected-item input");
const searchInputs = document.querySelectorAll(".search-input input");

const showLoading = () => {
  document.querySelector("#loading-screen").style.display = "flex";
};

const hideLoading = () => {
  document.querySelector("#loading-screen").style.display = "none";
};

// get the api data
const getApiData = async (endPoint, data) => {
  showLoading();
  try {
    const response = await axios.post(`/api/${endPoint}`, data);
    const result = response.data;
    return result;
  } catch (error) {
    console.log(error);
  } finally {
    hideLoading();
  }
};

//get current location
geolocation.getCurrentPosition(async (e) => {
  const currentCoords = {
    lat: e.coords.latitude,
    lon: e.coords.longitude,
  };

  //get the weather data for the current location
  try {
    const data = await getApiData("weather", { coords: currentCoords });
    const countries = await getApiData("countries");

    displayWeather(data);
    displayCountries(countries);

    //set the map view to the current location
    map.setView([data.map.lat, data.map.lon], 13);

    //add a marker to the map
    marker = L.marker([data.map.lat, data.map.lon]).addTo(map);


  } catch (error) {
    console.error(error);
  }
});

// Set the maximum bounds for the map
const bounds = [
  [-90, -180], // Southwest corner (latitude, longitude)
  [90, 180],   // Northeast corner (latitude, longitude)
];
map.setMaxBounds(bounds);

//add the OpenStreetMap Dark Mode tile layer to the map
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  subdomains: "abcd",
  maxZoom: 19,
  minZoom: 2,
}).addTo(map);



//add a marker to the map when the user clicks on the map
map.on("click", async (e) => {
  const clickedCoords = {
    lat: e.latlng.lat,
    lon: e.latlng.lng,
  };

  marker
    ? marker.setLatLng(e.latlng)
    : (marker = L.marker(e.latlng).addTo(map));
  map.panTo(e.latlng);

  dropdownInputs.forEach((input) => {
    input.value = "";
  });

  dropdownLists.forEach((list, index) => {
    //skip the first dropdown list (countries)
    if (index !== 0) {
      list.innerHTML = "";
    }
  });

  try {
    const data = await getApiData("weather", { coords: clickedCoords });
    displayWeather(data);
    weatherButton.dispatchEvent(new Event("click"));

  } catch (error) {
    console.log(error);
  }
});

const getWeatherData = async () => {
  try {
    const data = await getApiData("weather", { coords: {lat: marker.getLatLng().lat, lon: marker.getLatLng().lng} });
    displayWeather(data);
  } catch (error) {
    console.error(error);
  }
}
setInterval(getWeatherData, 100 * 60 * 5) // 5 minutes

const weatherApi = async () => {
  try {
    const data = await getApiData("weather", {
      country: dropdownInputs[0].value, //country input
      state: dropdownInputs[1].value, //state input
      city: dropdownInputs[2].value, //city input
    });

    // update map and marker
    map.setView([data.map.lat, data.map.lon], 10);
    marker
      ? marker.setLatLng([data.map.lat, data.map.lon])
      : (marker = L.marker([data.map.lat, data.map.lon]).addTo(map));

    // display the weather records
    displayWeather(data);
    weatherButton.dispatchEvent(new Event("click"));

  } catch (error) {
    console.error(error);
  }
};

const stateApi = async () => {
  //filters states name by countries name
  try {
    const data = await getApiData("states", {
      country: dropdownInputs[0].value, //country input
    });
    displayStates(data);
  } catch (error) {
    console.error(error);
  }
};

const cityApi = async () => {
  //filters cities name by states name
  try {
    const data = await getApiData("cities", {
      state: dropdownInputs[1].value, //state input
    });
    displayCities(data);
  } catch (error) {
    console.log(error);
  }
};

//add event listeners to the dropdown menus
dropdownMenus.forEach((dropdownMenu) => {
  dropdownMenu.addEventListener("submit", (e) => {
    switch (dropdownMenu) {
      //country dropdown menu
      case dropdownMenus[0]:
        stateApi(); //get the states by country name
        break;

      //state dropdown menu
      case dropdownMenus[1]:
        cityApi(); //get the cities by state name
        break;

      //city dropdown menu
      case dropdownMenus[2]:
        weatherApi(); //get the weather by city name
        break;

      default:
        console.log("default");
        break;
    }
  });
});

dropdownLists.forEach((list) => {
  list.addEventListener("click", (e) => {
    const parentDropdownMenu = e.target.closest(".dropdown-menu");
    const dropdownInput = parentDropdownMenu.querySelector(
      ".selected-item input"
    );
    parentDropdownMenu
      .querySelector(".dropdown-content")
      .classList.remove("active");

    dropdownInput.value = e.target.textContent;

    dropdownInput.dispatchEvent(new Event("input"));
    parentDropdownMenu.dispatchEvent(new Event("submit"));
  });
});



//filter the dropdown lists by search input
searchInputs.forEach((input) => {
  const parentDropdownMenu = input.closest(".dropdown-menu");
  const childDropdownContent =
    parentDropdownMenu.querySelector(".dropdown-content");

  input.addEventListener("input", () => {
    const filter = input.value.trim().toLocaleLowerCase("tr-TR"); // Use Turkish locale
    const items = childDropdownContent.querySelectorAll("li");

    for (let item of items) {
      const itemText = item.textContent.toLocaleLowerCase("tr-TR"); // Use Turkish locale
      if (itemText.includes(filter)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    }
  });
});

//close all dropdowns when clicking outside of them
document.addEventListener("click", (e) => {
  // close all dropdowns if the clicked element is not a dropdown menu or its child
  if (!e.target.closest(".dropdown-menu")) {
    document.querySelectorAll(".dropdown-content").forEach((content) => {
      content.classList.remove("active");
    });
  }
});

dropdownInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    // clear the values of the next dropdown inputs
    for (let i = index + 1; i < dropdownInputs.length; i++) {
      dropdownInputs[i].value = "";
    }
  });

  input.addEventListener("click", (e) => {
    const dropdownMenu = e.target.closest(".dropdown-menu");
    const dropdownContent = dropdownMenu.querySelector(".dropdown-content");

    // close all dropdowns
    document.querySelectorAll(".dropdown-content").forEach((content) => {
      if (content !== dropdownContent) {
        content.classList.remove("active");
      }
    });

    // open the clicked dropdown

    dropdownContent.classList.toggle("active"); // turn on/off the dropdown
    dropdownContent.querySelector(".search-input input").focus(); // focus on the search input
  });
});

//display the weather data for the state
const displayWeather = (data) => {

  //display current city
  const cityName = document.querySelector("#city-name");
  cityName.innerHTML = `${
    data.map.address?.town || data.map.address?.state || data.map.name
  }`;

  //display current temp
  const temperature = document.querySelector("#temperature");
  temperature.innerHTML = `${data.weather.current.temperature_2m}${data.weather.current_units.temperature_2m}`;

  const weatherIcon = document.querySelector("#weather-icon");
  weatherIcon.setAttribute(
    "src",
    data.weather.icons[data.weather.current.weather_code].day.image
  );

  //display a day's hourly temp
  const hourlyRecords = document.querySelector("#hourly-records ul");
  hourlyRecords.innerHTML = `
    ${data.weather.hourly.time
      .map((time, index) => {
        if (time.slice(8, 10) == new Date().getDate()) {
          const weatherCode = data.weather.hourly.weather_code[index];
          const icon = data.weather.icons[weatherCode].day.image;

          return `<li>
          <p>${data.weather.hourly.time[index].slice(-5)}</p>
          <img src="${icon}" alt="Weather Icon">
          <p>${data.weather.hourly.temperature_2m[index]}${
            data.weather.hourly_units.temperature_2m
          }</p>
        </li>`;
        }
      })
      .join("")}
  `;

  ///display current records

  const apparentTemperature = document.querySelector(
    "#apparent-temperature p"
  );
  apparentTemperature.innerHTML = `<p>${data.weather.current.apparent_temperature}${data.weather.current_units.apparent_temperature}</p>`;

  const humidity = document.querySelector("#humidity p");
  humidity.innerHTML = `<p>${data.weather.current.relative_humidity_2m}${data.weather.current_units.relative_humidity_2m}</p>`;

  const windSpeed = document.querySelector("#wind-speed p");
  windSpeed.innerHTML = `<p>${data.weather.current.wind_speed_10m} ${data.weather.current_units.wind_speed_10m}</p>`;

  const windDirection = document.querySelector("#wind-direction p");
  windDirection.innerHTML = `<p>${data.weather.current.wind_direction_10m}${data.weather.current_units.wind_direction_10m}</p>`;

  const pressure = document.querySelector("#pressure p");
  pressure.innerHTML = `<p>${data.weather.current.pressure_msl} ${data.weather.current_units.pressure_msl}</p>`;

  const rain = document.querySelector("#rain p");
  rain.innerHTML = `<p>${data.weather.current.precipitation} ${data.weather.current_units.precipitation}</p>`;

  const snow = document.querySelector("#snowfall p");
  snow.innerHTML = `<p>${data.weather.current.snowfall} ${data.weather.current_units.snowfall}</p>`;

  const cloudCover = document.querySelector("#cloud-cover p");
  cloudCover.innerHTML = `<p>${data.weather.current.cloud_cover}${data.weather.current_units.cloud_cover}</p>`;

  //display a week's daily records
  const dailyRecords = document.querySelector("#daily-records ul");
  dailyRecords.innerHTML = `
    ${data.weather.daily.time
      .map((time, index) => {
        const weatherCode = data.weather.daily.weather_code[index];
        const icon = data.weather.icons[weatherCode].day;

        const date = new Date(data.weather.daily.time[index]);
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        return `<li>
          <p>${days[date.getDay()]}</p>
          <div>
            <img src="${icon.image}">
            <p>${icon.description}</p>
          </div>
          <p>${data.weather.daily.temperature_2m_min[index]}${data.weather.daily_units.temperature_2m_min} / ${
          data.weather.daily.temperature_2m_max[index] 
      }${data.weather.daily_units.temperature_2m_max}</p>
        </li>
      `;
      })
      .join("")}
  `;
};

//display the countries dropdown menu
const displayCountries = (data) => {
  dropdownLists[0].innerHTML = `
    ${data
      .map((country) => {
        return `<li>${country}</li>`;
      })
      .join("")}
  `;
};

//display the states dropdown menu
const displayStates = (data) => {
  dropdownLists[1].innerHTML = `
  ${data
    .map((state) => {
      return `<li>${state.name}</li>`;
    })
    .join("")}
  `;
};

//display the cities dropdown menu
const displayCities = (data) => {
  dropdownLists[2].innerHTML = `
      ${data
        .map((city) => {
          return `<li>${city.name}</li>`;
        })
        .join("")}
  `;
};

document.addEventListener("DOMContentLoaded", () => {
  const scrollContainer = document.querySelector("#hourly-records ul");

  scrollContainer.addEventListener("wheel", (e) => {
    e.preventDefault(); // Prevent vertical scrolling
    scrollContainer.scrollLeft += e.deltaY; // Scroll horizontally based on the wheel delta
  });
});

document.querySelector("#map-button").addEventListener("click", () => {
  document.querySelector(".map-container").style.display = "grid";
  document.querySelector(".weather-container").style.display = "none";

  // Ensure the map is properly resized and rendered
  setTimeout(() => {
    map.invalidateSize();
  }, 0);
});

document.querySelector("#weather-button").addEventListener("click", () => {
  document.querySelector(".weather-container").style.display = "grid";
  document.querySelector(".map-container").style.display = "none";
});
