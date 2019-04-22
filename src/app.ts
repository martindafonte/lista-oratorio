// server.js
// where your node app starts

import dotenv = require("dotenv");
dotenv.config(); // Load dot env variables

import "marko/node-require"; // Allow Node.js to load .marko files

import express = require("express");
import bodyParser = require("body-parser");
import compression = require("compression");
import rp = require("request-promise-native");
import morgan = require("morgan");
import marko_express = require("marko/express");
import { AddressInfo } from "net";
import { registerPages } from "./routes/pages";
const app = express();

const isProduction = process.env.NODE_ENV === "production";

// Configure lasso to control how JS/CSS/etc. is delivered to the browser
require("lasso").configure({
  plugins: [
    "lasso-marko" // Allow Marko templates to be compiled and transported to the browser
  ],
  outputDir: __dirname + "/../public", // Place all generated JS/CSS/etc. files into the "static" dir
  bundlingEnabled: isProduction, // Only enable bundling in production
  minify: isProduction, // Only minify JS and CSS code in production
  fingerprintsEnabled: isProduction, // Only add fingerprints to URLs in production
});


app.use(require("lasso/middleware").serveStatic());

// compress our client side content before sending it over the wire
app.use(compression());
app.use(morgan("dev"));

app.use(marko_express()); // Enable res.marko(template, data)

// Help to parse body content in POST calls
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// Serves all files in public folder
app.use(express.static("public"));

// Configure default pages and views
registerPages(app);

// Add WebHooks to route
app.use("/api/webhook", require("./routes/web-hooks"));
// Add list manager api
app.use("/api/lists", require("./routes/list-manager-api"));


app.get("/*", (request, response) => {
  response.redirect("/");
});

app.use(function (req, res) {
  // URL Not found
  res.status(404).send({
    error: true,
    message: "No se encontró la URL especificada",
    url: req.originalUrl
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Your app is listening on port ${(listener.address() as AddressInfo).port}`);
});


// Keep Glitch from sleeping by periodically sending ourselves a http request
if (process.env.BASE_URL) {
  setInterval(function () {
    console.log("❤️ Keep Alive Heartbeat");

    rp(process.env.BASE_URL)
      .then(() => {
        console.log("💗 Successfully sent http request to Glitch to stay awake.");
      })
      .catch((err) => {
        console.error(`💔 Error sending http request to Glitch to stay awake: ${err.message}`);
      });
  }, 150000); // every 2.5 minutes
}