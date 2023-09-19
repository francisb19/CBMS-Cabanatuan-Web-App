var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");

const fetchDataRoute = require("./routes/FetchDataRoute");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Database Config
var DBConfig = {
  driver: "msnodesqlv8",
  server: "192.168.14.96",
  database: "GeoTaggingMonitoringSystem",
  options: {
    trustedConnection: true,
    useUTC: true,
  },
};

app.use(fetchDataRoute);

var server = app.listen(5010, function () {
  console.log("Server is running..");
});
