import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

let countriesList = [];
let citiesList = [];

app.use(express.static("public"));
app.use(express.static("node_modules/leaflet/dist"));
app.use(express.static("node_modules/axios/dist"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://countriesnow.space/api/v0.1/countries"
    );
    countriesList = response.data.data;
    res.render("app.ejs");
  } catch (error) {
    console.log(error);
  }
});

app.post("/app/api", async (req, res) => {
  try {
    for (let countryInfo of countriesList) {
      if (countryInfo.country === req.body.location) {
        citiesList = countryInfo.cities;
      }
    }

    //get the coordinates for the city
    const mapResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${req.body.location}&format=json&`
    );

    const mapData = mapResponse.data.filter((item) => {
      return item.addresstype !== "province";
    })[0];

    const coords = {
      lat: mapData.name !== "undefined" ? mapData.lat : req.body.coords.lat,
      lon: mapData.name !== "undefined" ? mapData.lon : req.body.coords.lon,
    };

    //get the weather data for the city
    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,sunshine_duration,uv_index_max,rain_sum,sunrise,sunset,daylight_duration,snowfall_sum,showers_sum,precipitation_sum&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,rain,showers,snowfall,snow_depth,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,rain,cloud_cover,wind_direction_10m,apparent_temperature,showers,pressure_msl,is_day,snowfall,surface_pressure,precipitation&timezone=GMT`
    );
    const weatherData = weatherResponse.data;

    res.json({
      coords: coords,
      weather: weatherData,
      countriesList: countriesList,
      citiesList: citiesList,
    });
  } catch (error) {
    res.send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
