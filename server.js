const express = require('express');
const fetch = require('node-fetch');
const Datastore = require('nedb');
const { json } = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8082;

app.listen(port, () => {
  console.log(`App is running: http://localhost:${port}`);
});

app.use(express.static('public'));

app.use(express.json({
  limit: '1mb'
}));

// Define and load database
const database = new Datastore('database/database.db');
database.loadDatabase();

// Database API (POST / Insert)
app.post('/api', (req, res) => {
  // Send information to the database
  console.log('Database post endpoint got a request');
  const data = req.body;

  const timestamp = Date.now();
  data.timestamp = timestamp;

  data.success = true;
  database.insert(data);
  res.json(data);
})

// Database API (GET / Read)
app.get('/api', (req, res) => {
  // Send the db data to client
  database.find({}, (err, data) => {

    if (err) {
      console.error(err)
      res.end()
    };

    // Send data to client
    res.json(data);
  })
  
})

// Weather API endpoint
app.get('/weather/:latlon', async (req, res) => {
  const latlon = req.params.latlon.split(',');
  const lat = latlon[0];
  const lon = latlon[1];
  // console.log(lat, lon)

  // API Key to openweathermap.org
  const apiKey = {
    OWM: process.env.API_KEY_OWM,
    AQI: process.env.API_KEY_AQI
  }

  // Weather request
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey.OWM}&units=metric&lang=de`;
  const weatherResponse = await fetch(weatherUrl);
  const weatherJson = await weatherResponse.json();

  // console.log(weatherJson);


  // AQI request
  const airqualityUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey.AQI}`;
  const airqualityResponse = await fetch(airqualityUrl);
  const airqualityJson = await airqualityResponse.json();

  // console.log(airqualityJson);


  // Response
  const data = {
    weather: weatherJson,
    airquality: airqualityJson
  }
  res.json(data)
})