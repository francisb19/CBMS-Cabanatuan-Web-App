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

//Fetch Supply Types (✓)
router.get("/getSupplyTypes", function (req, res) {
  //Fetch Property Types
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM SupplyType ORDER BY SupplyType";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Supply Types Sucessfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

module.exports = router;
