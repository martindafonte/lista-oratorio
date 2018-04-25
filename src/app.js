// server.js
// where your node app starts

require('dotenv').config(); //Load dot env variables

const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const rp = require('request-promise-native');
const morgan = require('morgan');
// const db = require('./database');
const app = express();


// compress our client side content before sending it over the wire
app.use(compression());
app.use(morgan('dev'));

//Permite servir todos los archivos de la carpeta public
app.use(express.static('public'))

// ayuda a parsear el contenido del body en los métodos POST
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());



//DEMO Cambiar y borrar
app.get("/", (request, response) => {
  response.redirect('/index.html');
})

const dream_routes = require('./routes/dreams')(app);

//Add WebHooks to route
app.use('/api/webhook', require('./routes/web-hooks'));
//Add list manager api
app.use('/api/lists', require('./routes/list-manager-api'));


app.use(function (req, res) {
  //No se encontró la URL
  res.status(404).send({
    error: true,
    message: 'No se encontró la URL especificada',
    url: req.originalUrl
  });
})

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})


// Keep Glitch from sleeping by periodically sending ourselves a http request
setInterval(function () {
  console.log('❤️ Keep Alive Heartbeat');

  rp(process.env.BASE_URL)
    .then(() => {
      console.log('💗 Successfully sent http request to Glitch to stay awake.');
    })
    .catch((err) => {
      console.error(`💔 Error sending http request to Glitch to stay awake: ${err.message}`);
    });
}, 150000); // every 2.5 minutes