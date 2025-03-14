import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.static("node_modules/leaflet/dist"));
app.use(express.static("node_modules/axios/dist"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const getCoordinates = async (req, res, next) => {
  const city = req.body.city;
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${city}&format=json&`
    );

    const data = response.data.filter((item) => {
      return item.addresstype !== "province";
    })[0];

    const coords = {
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
    };

    req.coords = coords;
    next();
  } catch (error) {
    res.send(error);
  }
};
app.use(getCoordinates);

app.get("/", (req, res) => {
  res.render("app.ejs");
});

app.post("/map/api", getCoordinates, (req, res) => {
  res.json(req.coords);
});

// app.get("/", (req, res) => {
//   res.render("index.ejs");
// });

// app.post("/api/city", async (req, res) => {
//   const city = req.body.city;
//   console.log(req);
//   try {
//     const mapResponse = await axios.get(
//       `https://nominatim.openstreetmap.org/search?q=${city}&format=json&`
//     );

//     const mapResponseData = mapResponse.data.filter(
//       (item) => item.addresstype !== "province"
//     )[0];

//     const lat = parseFloat(mapResponseData.lat).toFixed(2);
//     const lon = parseFloat(mapResponseData.lon).toFixed(2);

//     const weatherResponse = await axios.get(
//       `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&current=temperature_2m`
//     );
//     const weatherResponseData = weatherResponse.data;

//     res.json([mapResponseData,weatherResponseData]);

//     console.log(weatherResponse.data);
//   } catch (error) {
//     res.send(error);
//   }
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
