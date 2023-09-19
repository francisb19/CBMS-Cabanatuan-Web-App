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

//Fetch User Roles (✓)
router.get("/getUserRoles", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM UserRole ORDER BY RecordNo";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Roles Sucessfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Users (✓)
router.get("/getUsers", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM UserDataView ORDER BY Username";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Users Sucessfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

module.exports = router;
