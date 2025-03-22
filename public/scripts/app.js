const form = document.querySelector("#form");
const geolocation = window.navigator.geolocation;
const map = L.map("map");
let marker;
let currentCoords;
const countries = document.querySelector("#countries");
const cities = document.querySelector("#cities");

//get current location
geolocation.getCurrentPosition(async (e) => {
  currentCoords = {
    lat: e.coords.latitude,
    lon: e.coords.longitude,
  };

  //get the weather data for the current location
  try {
    const data = await getApiData({ coords: currentCoords });
    displayWeather(data.weather);
    displayCountries(data.countriesList);

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
    const data = await getApiData({ coords });
    displayWeather(data.weather);
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
    //get the weather data and location for the city
    // const data = await getApiData({ location: countries.value});
    // console.log(data.citiesList)
    let data;
    if (!cities.value) {
      data = await getApiData({ location: countries.value });
    } else {
      data = await getApiData({
        location: countries.value + " " + cities.value,
      });
    }
    displayCities(data.citiesList);

    if (Object.entries(data.coords).length > 0) {
      map.setView([data.coords.lat, data.coords.lon], 13);
      marker
        ? marker.setLatLng([data.coords.lat, data.coords.lon])
        : (marker = L.marker([data.coords.lat, data.coords.lon]).addTo(map));

      displayWeather(data.weather);
    } else {
      console.log("City not found");
    }
  } catch (error) {
    console.error(error);
  }
});

// get the api data
const getApiData = async (data) => {
  try {
    const response = await axios.post("/app/api", data);
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

const displayCities = (data) => {
  const citiesSelect = document.querySelector("#cities");
  citiesSelect.innerHTML = `
      <option value="" selected disabled hidden>Please, select a city</option>
      ${data.map((city) => {
        return `<option ${`value = ${city}`}>${city}</option>`;
      })}
  `;
};
