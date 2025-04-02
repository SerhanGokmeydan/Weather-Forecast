//map
const geolocation = window.navigator.geolocation;
const map = L.map("map");
let marker;

const dropdownMenus = document.querySelectorAll(".dropdown-menu");
const dropdownContents = document.querySelectorAll(".dropdown-content");
const dropdownLists = document.querySelectorAll(".dropdown-list");
const dropdownInputs = document.querySelectorAll(".selected-item input");
const searchInputs = document.querySelectorAll(".search-input input");

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

//get current location
geolocation.getCurrentPosition(async (e) => {
  const currentCoords = {
    lat: e.coords.latitude,
    lon: e.coords.longitude,
  };

  //get the weather data for the current location
  try {
    const data = await getApiData("weather", { coords: currentCoords });
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

const weatherApi = async () => {
  try {
    const data = await getApiData("weather", {
      country: dropdownInputs[0].value, //country input
      state: dropdownInputs[1].value, //state input
      city: dropdownInputs[2].value, //city input
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

//filter the dropdown lists by search input
searchInputs.forEach((input) => {
  const parentDropdownMenu = input.closest(".dropdown-menu");
  const childDropdownContent =
    parentDropdownMenu.querySelector(".dropdown-content");

  input.addEventListener("input", () => {
    const filter = input.value.toLowerCase().trim();
    const items = childDropdownContent.querySelectorAll("li");

    for (let item of items) {
      const itemText = item.textContent.toLowerCase();
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
    // close all dropdowns
    document.querySelectorAll(".dropdown-content").forEach((content) => {
      content.classList.remove("active");
    });

    // open the clicked dropdown
    const dropdownMenu = e.target.closest(".dropdown-menu");
    const dropdownContent = dropdownMenu.querySelector(".dropdown-content");

    dropdownContent.classList.toggle("active"); // turn on/off the dropdown
  });
});

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
  dropdownLists[1].innerHTML = `
  ${data
    .map((state) => {
      return `<li>${state.name}</li>`;
    })
    .join("")}
  `;
};

//display the cities select dropdown menu
const displayCities = (data) => {
  dropdownLists[2].innerHTML = `
      ${data
        .map((city) => {
          return `<li>${city.name}</li>`;
        })
        .join("")}
  `;
};
