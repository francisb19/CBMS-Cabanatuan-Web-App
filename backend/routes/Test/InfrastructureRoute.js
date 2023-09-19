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

//Fetch Infrastructure (✓)
router.get("/getInfrastructures", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM InfrastructureAssetDetailsView WHERE CondemnStatus = 'Active' ORDER BY InfrastructureAssetId";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Infrastructure Assets Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Condemned Infrastructure (✓)
router.get("/getCondemnedInfrastructures", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM InfrastructureAssetDetailsView WHERE CondemnStatus = 'Condemned' ORDER BY InfrastructureAssetId";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Condemned Infrastructure Assets Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

module.exports = router;
