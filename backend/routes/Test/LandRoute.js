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
//Fetch Land Types (✓)
router.get("/getLandTypes", function (req, res) {
  //Fetch Land Types
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM LandType ORDER BY LandType";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Land Type Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Title Owners (✓)
router.get("/getTitleOwners", function (req, res) {
  //Fetch Title Owners
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM TitleOwner ORDER BY TitleOwner";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Title Owner Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Lands
router.get("/getLands", function (req, res) {
  //Fetch Lands
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM LandDetailsView WHERE CondemnStatus = 'Active' ORDER BY LandId";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Lands Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Condemned Lands
router.get("/getCondemnedLands", function (req, res) {
  //Fetch Lands
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM LandDetailsView WHERE CondemnStatus = 'Condemned' ORDER BY LandId";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Condemned Lands Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

module.exports = router;
