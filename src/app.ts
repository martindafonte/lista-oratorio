// server.js
// where your node app starts

import dotenv = require('dotenv');
dotenv.config(); //Load dot env variables

import 'marko/node-require';//Allow Node.js to load .marko files

import express = require('express');
import bodyParser = require('body-parser');
import compression = require('compression');
import rp = require('request-promise-native');
import morgan = require('morgan');
import marko_express = require('marko/express');
import { AddressInfo } from 'net';

const app = express();



// compress our client side content before sending it over the wire
app.use(compression());
app.use(morgan('dev'));

app.use(marko_express());//Enable res.marko(template, data)

// Help to parse body content in POST calls
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

//Serves all files in public folder
app.use(express.static('public'))

//Configure default pages and views
require('./routes/pages')(app);

//Add WebHooks to route
app.use('/api/webhook', require('./routes/web-hooks'));
//Add list manager api
app.use('/api/lists', require('./routes/list-manager-api'));


app.get("/*", (request, response) => {
  response.redirect('/');
})

app.use(function (req, res) {
  //URL Not found
  res.status(404).send({
    error: true,
    message: 'No se encontró la URL especificada',
    url: req.originalUrl
  });
})

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${(listener.address() as AddressInfo).port}`)
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