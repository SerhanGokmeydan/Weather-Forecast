const geolocation = window.navigator.geolocation;
const map = L.map("map");
let marker;

const form = document.querySelector("#form");
const countries = document.querySelector("#countries");
const cities = document.querySelector("#cities");
let previousCountryValue = "";

//get current location
geolocation.getCurrentPosition(async (e) => {
  const currentCoords = {
    lat: e.coords.latitude,
    lon: e.coords.longitude,
  };

  //get the weather data for the current location
  try {
    const weatherData = await getApiData("weather", { coords: currentCoords });
    const placeData = await getApiData("place");

    displayWeather(weatherData.weather);
    displayCountries(placeData.countries);

    //set the map view to the current location
    map.setView([currentCoords.lat, currentCoords.lon], 13);

    //add a marker to the map
    marker = L.marker([currentCoords.lat, currentCoords.lon]).addTo(map);
  } catch (error) {
    console.error(error);
  }
});

//add the OpenStreetMap tile layer to the map
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png?", {
  maxZoom: 19,
  minZoom: 2,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

//add a marker to the map when the user clicks on the map
const onMapClick = async (e) => {
  const coords = {
    lat: e.latlng.lat,
    lon: e.latlng.lng,
  };

  marker
    ? marker.setLatLng(e.latlng)
    : (marker = L.marker(e.latlng).addTo(map));
  map.panTo(e.latlng);

  try {
    const weatherData = await getApiData("weather", { coords });
    displayWeather(weatherData.weather);
  } catch (error) {
    console.log(error);
  }
};
map.on("click", onMapClick);

countries.addEventListener("input", () => {
  form.dispatchEvent(new Event("submit"));
});

cities.addEventListener("input", () => {
  form.dispatchEvent(new Event("submit"));
});


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    // get weather and locations datas
    let weatherData;
    let zoom;
    if (!cities.value) {
      weatherData = await getApiData("weather", { location: countries.value });
      zoom = 6;
    } else {
      weatherData = await getApiData("weather", {
        location: countries.value + " " + cities.value,
      });
      zoom = 10;
    }

    //make a post request for /api/place if the country value have changed
    if (countries.value !== previousCountryValue) {
      const placeData = await getApiData("place");
      displayCities(placeData.cities);

      // keep the new country value
      previousCountryValue = countries.value;
    }

    // update map and marker
    map.setView([weatherData.coords.lat, weatherData.coords.lon], zoom);
    marker
      ? marker.setLatLng([weatherData.coords.lat, weatherData.coords.lon])
      : (marker = L.marker([
          weatherData.coords.lat,
          weatherData.coords.lon,
        ]).addTo(map));

    // display the weather records
    displayWeather(weatherData.weather);
  } catch (error) {
    console.error(error);
  }
});

// get the api data
const getApiData = async (endPoint, data) => {
  try {
    const response = await axios.post(`/api/${endPoint}`, data);
    const result = response.data;
    return result;
  } catch (error) {
    console.log(error);
  }
};

//display the weather data for the city
const displayWeather = (data) => {
  const weatherRecords = document.querySelector("#weather-records");
  weatherRecords.innerHTML = `
    <ul id="weather-records-list">
      ${Object.keys(data)
        .map((key) => {
          return `<li>${key}: ${data[key]}</li>`;
        })
        .join("")}
    </ul>
  `;
};

//display the countries dropdown menu
const displayCountries = (data) => {
  const countriesList = document.querySelector("#countries");
  countriesList.innerHTML += `
    ${data.map((countryInfo) => {
      return `<option ${`value = ${countryInfo.country}`}>${
        countryInfo.country
      }</option>`;
    })}
  `;
};

//display the cities dropdown menu
const displayCities = (data) => {
  if (!data || data.length === 0) {
    return;
  }

  const citiesSelect = document.querySelector("#cities");
  citiesSelect.innerHTML = `
      <option value="" selected disabled hidden>Please, select a city</option>
      ${data.map((city) => {
        return `<option ${`value = ${city}`}>${city}</option>`;
      })}
  `;
};
