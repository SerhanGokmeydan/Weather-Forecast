import fs from "fs";
import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

let jsonData;

app.use(express.static("public"));
app.use(express.static("node_modules/leaflet/dist"));
app.use(express.static("node_modules/axios/dist"));

app.use(express.json());

app.get("/", (req, res) => {
  fs.readFile("countries+states+cities.json", "utf-8", (error, data) => {
    if (error) {
      res.send(error);
      return;
    }
    jsonData = JSON.parse(data);
    const countries = jsonData.map((item) => item.name);

    res.render("app.ejs", {
      countries: countries,
    });
  });
});

app.post("/api/weather", async (req, res) => {
  try {
    //get the coords info by using place name
    const mapResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${
        req.body.country + " " + req.body.state + " " + req.body.city
      }&format=json&accept-language=en`
    );
    const mapData = mapResponse.data[0];

    //get the coordinates data
    const coords = {
      lat: req.body.coords ? req.body.coords.lat : mapData.lat,
      lon: req.body.coords ? req.body.coords.lon : mapData.lon,
    };

    //get the weather data
    const currentWeatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,rain,cloud_cover,wind_direction_10m,apparent_temperature,showers,pressure_msl,is_day,snowfall,surface_pressure,precipitation&timezone=GMT`
    );
    const currentWeatherData = currentWeatherResponse.data;

    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,sunshine_duration,uv_index_max,rain_sum,sunrise,sunset,daylight_duration,snowfall_sum,showers_sum,precipitation_sum&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,rain,showers,snowfall,snow_depth,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation&timezone=GMT`
    );
    const weatherData = weatherResponse.data;

    res.json({
      coords: coords,
      weather: { ...currentWeatherData, ...weatherData },
    });
  } catch (error) {
    res.send(error);
  }
});

//filter the states by name
let states = [];
app.post("/api/states", (req, res) => {
  for (let country of jsonData) {
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
