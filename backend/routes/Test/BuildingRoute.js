var express = require("express");
var sql = require("mssql/msnodesqlv8");
var moment = require("moment");
const bcrypt = require("bcrypt");
const e = require("express");
const router = express.Router();
//(✓)
// Database Config
var DBConfig = {
  driver: "msnodesqlv8",
  server: "localhost",
  database: "InventorySystem",
  options: {
    trustedConnection: true,
    useUTC: true,
  },
};

//Fetch Building (✓)
router.get("/getBuildings", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM BuildingDetailsView WHERE CondemnStatus = 'Active' ORDER BY ItemNo";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Buildings Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Condemned Building (✓)
router.get("/getCondemnedBuildings", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM BuildingDetailsView WHERE CondemnStatus = 'Condemned' ORDER BY ItemNo";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Condemned Buildings Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

module.exports = router;
