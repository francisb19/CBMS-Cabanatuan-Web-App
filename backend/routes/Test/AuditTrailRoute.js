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

//Fetch Item Audit Trail
router.get("/getItemAuditTrail/:propType/:ppeId", async function (req, res) {
  let ppeId = req.params.ppeId;
  let propType = req.params.propType;

  //Get Ppe Details Id
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM AuditTrailView WHERE PropertyTypeId = " +
        propType +
        " AND PpeId = " +
        ppeId +
        " AND ActivityLocationId = 1";
      console.log(query);
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log("Fetch Item Audit Trail Successfully!");
      await res.json(result.recordset);
      await sql.close();
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });
});

//Fetch Document Audit Trail
router.get("/getDocumentAuditTrail/:docNo", async function (req, res) {
  let docNo = req.params.docNo;

  //Get Ppe Details Id
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM AuditTrailView WHERE ChangedItemId = " +
        docNo +
        " AND ActivityLocationId = 2";
      console.log(query);
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log("Fetch Document Audit Trail Successfully!");
      await res.json(result.recordset);
      await sql.close();
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });
});

module.exports = router;
