const form = document.querySelector("#form");
const geolocation = window.navigator.geolocation;
const map = L.map("map");
let marker;
let coords;

//get current location
geolocation.getCurrentPosition(async (e) => {
  coords = {
    lat: e.coords.latitude,
    lon: e.coords.longitude,
  };
  
  //set the map view to the current location
  map.setView([coords.lat, coords.lon], 13);

  //add a marker to the map
  marker = L.marker([coords.lat, coords.lon]).addTo(map);
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

  const mapForm = new FormData(form);
  const formData = {};
  mapForm.forEach((value, key) => {
    formData[key] = value;
  });

  try {
    const mapResponse = await axios.post("/map/api", formData);
    const mapData = mapResponse.data;

    if (Object.entries(mapData).length > 0) {
      map.setView([mapData.lat, mapData.lon], 13);
      marker
        ? marker.setLatLng([mapData.lat, mapData.lon])
        : (marker = L.marker([mapData.lat, mapData.lon]).addTo(map));
    } else {
      console.log("City not found");
    }

  } catch (error) {
    console.error(error);
  }
});

// const geolocation = window.navigator.geolocation;
// const map = L.map("map");
// const popup = L.popup();
// let marker;

// // Get the current location
// geolocation.getCurrentPosition((e) => {
//   const coords = {
//     latitude: e.coords.latitude,
//     longitude: e.coords.longitude,
//   };

//   // Set the map view to the current location
//   map.setView([coords.latitude, coords.longitude], 13);

//   // Add a marker to the map
//   marker = L.marker([coords.latitude, coords.longitude]).addTo(map);
// });

// L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png?", {
//   maxZoom: 19,
//   minZoom: 2,
//   attribution:
//     '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
// }).addTo(map);

// const onMapClick = (e) => {
//   marker
//     ? marker.setLatLng(e.latlng)
//     : (marker = L.marker(e.latlng).addTo(map));
//   map.panTo(e.latlng);
// };
// map.on("click", onMapClick);

// document.querySelector("#city-form").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const city = document.querySelector("#city-input").value;
//   try {
//     const response = await axios.post("/api/city", { city });
//     const data = response.data[0];

//     if (data) {
//       const coords = {
//         lat: data.lat,
//         lon: data.lon,
//       };

//       map.setView([coords.lat, coords.lon], 13);
//       marker
//         ? marker.setLatLng([coords.lat, coords.lon])
//         : (marker = L.marker([coords.lat, coords.lon]).addTo(map));
//     } else {
//       console.log("City not found");
//     }
//   } catch (error) {
//     console.error(error);
//   }
// });
