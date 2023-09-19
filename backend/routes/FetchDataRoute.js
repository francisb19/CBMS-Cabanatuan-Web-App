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
  server: "192.168.14.96",
  database: "GeoTaggingMonitoringSystem",
  options: {
    trustedConnection: true,
    useUTC: true,
  },
};

//Fetch Barangays
router.get("/getBarangays", async function (req, res) {
  //Get Ppe Details Id
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT OID as id, BarangayName as choice FROM Barangay ORDER BY BarangayName";
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log("Fetch Barangays Successfully!");
      await res.json(result.recordset);
      await sql.close();
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });
});

module.exports = router;
