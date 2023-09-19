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

//Fetch Item History
router.get("/getItemHistory/:propType/:ppeId", async function (req, res) {
  let ppeId = req.params.ppeId;
  let propType = req.params.propType;

  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM ItemHistoryView WHERE PpeId = " +
        ppeId +
        " AND PropertyTypeId = " +
        propType +
        " ORDER BY YearOfTransaction DESC, MonthOfTransaction DESC, DayOfTransaction DESC";
      console.log(query);
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log("Fetch Item History Successfully!");
      await res.json(result.recordset);
      await sql.close();
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });
});

module.exports = router;
