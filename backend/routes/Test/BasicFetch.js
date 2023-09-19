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

//Fetch Months✓)
router.get("/getMonths", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Month ORDER BY RecordNo";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Months Sucessfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

module.exports = router;
