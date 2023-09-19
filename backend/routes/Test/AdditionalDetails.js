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

//Fetch Detail Name (✓)
router.get("/getDetailNames", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM DetailName ORDER BY DetailName";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Detail Names Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Additional Details by PpeId (✓)
router.get("/getAdditionalDetails/:ppeId", async function (req, res) {
  let ppeId = parseInt(req.params.ppeId);
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM AdditionalDetailView WHERE PpeId = " +
        ppeId +
        " AND AdditionalDetailDeletedState = 'False' ORDER BY PpeId";
      console.log(query);
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Additional Details Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

module.exports = router;
