import express from "express";
// import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.static("node_modules/leaflet/dist"));
app.use(express.static("node_modules/axios/dist"));

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.json());

app.get("/", (req, res) => {
  res.render("app.ejs");
});

app.post("/app/api", async (req, res) => {

  try {
    const mapResponse = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${req.body.city}&format=json&`
    );

    const mapData = mapResponse.data.filter((item) => {
      return item.addresstype !== "province";
    })[0];

    const coords = {
      lat: mapData.name !== "undefined" ? mapData.lat : req.body.coords.lat,
      lon: mapData.name !== "undefined" ? mapData.lon : req.body.coords.lon,
    };

    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m`
    );
    const weatherData = weatherResponse.data;

    res.json({
      coords: coords,
      weather: weatherData,
    });
    
  } catch (error) {
    res.send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
