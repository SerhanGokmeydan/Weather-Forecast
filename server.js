import fs from "fs";
import express from "express";
import axios from "axios";


const app = express();
const port = 3000;

// Load JSON files using fs
const icons = JSON.parse(fs.readFileSync("icons.json", "utf-8"));

const countriesData = JSON.parse(
  fs.readFileSync("countries+states+cities.json", "utf-8")
);

app.use(express.static("public"));
app.use(express.static("node_modules/leaflet/dist"));
app.use(express.static("node_modules/axios/dist"));

app.use(express.json());

app.get("/", (req, res) => {
  res.render("app.ejs");
});

app.post("/api/weather", async (req, res) => {
  try {
    //get the coords
    let mapResponse;
    let mapData;

    if(req.body.coords) {
      //if the coords are provided, use them to get the map data
      mapResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${req.body.coords.lat}&lon=${req.body.coords.lon}&format=json&accept-language=en`
      );
      mapData = mapResponse.data;

    } else {
      mapResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${
          req.body.country + " " + req.body.state + " " + req.body.city
        }&format=json&accept-language=en`
      );
      mapData = mapResponse.data[0];
    }

    //get the weather data
    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${mapData.lat}&longitude=${mapData.lon}&current=is_day,temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,rain,cloud_cover,wind_direction_10m,apparent_temperature,showers,pressure_msl,is_day,snowfall,surface_pressure,precipitation&daily=weather_code,sunshine_duration,uv_index_max,rain_sum,sunrise,sunset,daylight_duration,snowfall_sum,showers_sum,precipitation_sum,temperature_2m_max,temperature_2m_min&hourly=is_day,temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,rain,showers,snowfall,snow_depth,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation&timezone=GMT`
    );
    const weatherData = weatherResponse.data;

    res.json({
      weather: {...weatherData, icons},
      map: mapData
    });
  } catch (error) {
    res.send(error);
  }
});

app.post("/api/countries", (req, res) => { // Use the imported JSON data
  const countries = countriesData.map((country) => country.name);

  res.json(countries);
});

//filter the states by name
let states = [];
app.post("/api/states", (req, res) => {
  for (let country of countriesData) {
    if (country.name === req.body.country) {
      states = country.states;
    }
  }

  res.json(states);
});

//filter the cities by name
app.post("/api/cities", (req, res) => {
  let cities = [];

  for (let state of states) {
    if (state.name === req.body.state) {
      cities = state.cities;
    }
  }

  res.json(cities);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
