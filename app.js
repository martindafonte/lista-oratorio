// server.js
// where your node app starts

// init project
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const rp = require('request-promise');
// const db = require('./database');
const app = express();


// compress our client side content before sending it over the wire
app.use(compression());

//Permite servir todos los archivos de la carpeta public
app.use(express.static('public'))

// ayuda a parsear el contenido del body en los métodos POST
app.use(bodyParser.urlencoded({ extended: false }));



//DEMO Cambiar y borrar
app.get("/", (request, response) => {
  response.redirect('/index.html');
})

const dream_routes = require('./src/routes/dreams')(app);


// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})


// Keep Glitch from sleeping by periodically sending ourselves a http request
setInterval(function () {
  console.log('❤️ Keep Alive Heartbeat');

  rp('https://glitch.com/#!/project/' + process.env.PROJECT_DOMAIN)
    .then(() => {
      console.log('💗 Successfully sent http request to Glitch to stay awake.');
    })
    .catch((err) => {
      console.error(`💔 Error sending http request to Glitch to stay awake: ${err.message}`);
    });
}, 150000); // every 2.5 minutes