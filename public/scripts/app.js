//map
const geolocation = window.navigator.geolocation;
const map = L.map("map");
let marker;

//forms
const countriesForm = document.querySelector("#countries-form");
const statesForm = document.querySelector("#states-form");
const citiesForm = document.querySelector("#cities-form");

//inputs
const countriesInput = document.querySelector("#countries-input");
const statesInput = document.querySelector("#states-input");
const citiesInput = document.querySelector("#cities-input");

//selectors
const countriesSelect = document.querySelector("#countries-select");
const statesSelect = document.querySelector("#states-select");
const citiesSelect = document.querySelector("#cities-select");

//get current location
geolocation.getCurrentPosition(async (e) => {
  const currentCoords = {
    lat: e.coords.latitude,
    lon: e.coords.longitude,
  };

  //get the weather data for the current location
  try {
    const data = await getApiData("weather", { coords: currentCoords });
    console.log(data.weather)
    displayWeather(data.weather);

    //set the map view to the current location
    map.setView([currentCoords.lat, currentCoords.lon], 13);

    //add a marker to the map
    marker = L.marker([currentCoords.lat, currentCoords.lon]).addTo(map);
  } catch (error) {
    console.error(error);
  }
});

//add the OpenStreetMap tile layer to the map
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
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

  try {
    const data = await getApiData("weather", { coords: clickedCoords });
    displayWeather(data.weather);

  } catch (error) {
    console.log(error);
  }
});

//filter the countries by input value
countriesInput.addEventListener("input", () => {
  const filter = countriesInput.value.toLowerCase().trim();
  const options = countriesSelect.options;
  
  for (let i = 0; i < options.length; i++){
    const optionText = options[i].text.toLowerCase();
    if (optionText.includes(filter)) {
      options[i].style.display = "block";
    } else {
      options[i].style.display = "none";
    }
  }
})

//filter  the states by input value
statesInput.addEventListener("input", () => {
  const filter = statesInput.value.toLowerCase().trim();
  const options = statesSelect.options;
  
  for (let i = 0; i < options.length; i++){
    const optionText = options[i].text.toLowerCase();
    if (optionText.includes(filter)) {
      options[i].style.display = "block";
    } else {
      options[i].style.display = "none";
    }
  }
})

//filter the cities by input value
citiesInput.addEventListener("input", () => {
  const filter = citiesInput.value.toLowerCase().trim();
  const options = citiesSelect.options;
  
  for (let i = 0; i < options.length; i++){
    const optionText = options[i].text.toLowerCase();
    if (optionText.includes(filter)) {
      options[i].style.display = "block";
    } else {
      options[i].style.display = "none";
    }
  }
})

//direct the input listeners to the submit listeners
countriesSelect.addEventListener("input", () => {
  countriesForm.dispatchEvent(new Event("submit"));
});

statesSelect.addEventListener("input", () => {
  statesForm.dispatchEvent(new Event("submit"));
});

citiesSelect.addEventListener("input", () => {
  citiesForm.dispatchEvent(new Event("submit"));
});

//add event listeners to the forms
countriesForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  //filters states name by countries name
  try {
    const data = await getApiData("states", {
      country: countriesSelect.value,
    });
    displayStates(data);
  } catch (error) {
    console.error(error);
  }
});


statesForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  //filters cities name by states name
  try {
    const data = await getApiData("cities", {
      state: statesSelect.value,
    });

    displayCities(data);
  } catch (error) {
    console.log(error);
  }
});

citiesForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const data = await getApiData("weather", {
      country: countriesSelect.value,
      state: statesSelect.value,
      city: citiesSelect.value,
    });

    // update map and marker
    map.setView([data.coords.lat, data.coords.lon], 10);
    marker
      ? marker.setLatLng([data.coords.lat, data.coords.lon])
      : (marker = L.marker([data.coords.lat, data.coords.lon]).addTo(map));

    // display the weather records
    displayWeather(data.weather);
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

//display the weather data for the state
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

//display the states select dropdown menu
const displayStates = (data) => {
  statesSelect.innerHTML = `
  <option value="" selected disabled hidden>Please, select a state</option>
  ${data.map((state) => {
        return `<option>${state.name}</option>`;
      })}
  `;
};

//display the cities select dropdown menu
const displayCities = (data) => {
  citiesSelect.innerHTML = `
  <option value="" selected disabled hidden>Please, select a city</option>
      ${data.map((city) => {
        return `<option>${city.name}</option>`;
      })}
  `;
};
