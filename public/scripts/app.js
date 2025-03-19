const form = document.querySelector("#form");
const geolocation = window.navigator.geolocation;
const map = L.map("map");
let marker;
let currentCoords;

//get current location
geolocation.getCurrentPosition(async (e) => {
  currentCoords = {
    lat: e.coords.latitude,
    lon: e.coords.longitude,
  };

  try {
    const response = await axios.post("/app/api", { coords: currentCoords });
    const data = response.data;

    //set the map view to the current location
    map.setView([currentCoords.lat, currentCoords.lon], 13);

    //add a marker to the map
    marker = L.marker([currentCoords.lat, currentCoords.lon]).addTo(map);

  } catch (error) {
    console.error(error);
  }
});

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png?", {
  maxZoom: 19,
  minZoom: 2,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const onMapClick = (e) => {
  marker
    ? marker.setLatLng(e.latlng)
    : (marker = L.marker(e.latlng).addTo(map));
  map.panTo(e.latlng);
};
map.on("click", onMapClick);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const city = document.querySelector("#city").value;
  try {
    const response = await axios.post("/app/api", { city });
    const data = response.data;

    if (Object.entries(data).length > 0) {
      map.setView([data.coords.lat, data.coords.lon], 13);
      marker
        ? marker.setLatLng([data.coords.lat, data.coords.lon])
        : (marker = L.marker([data.coords.lat, data.coords.lon]).addTo(map));
    } else {
      console.log("City not found");
    }
  } catch (error) {
    console.error(error);
  }
});
