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

//Fetch Office Employees By Office Id (✓)
router.get("/getEmployeesByOffice/:officeId", function (req, res) {
  let officeId = req.params.officeId;
  //Database Connection
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM OfficeEmployee WHERE OfficeId = " +
        officeId +
        " ORDER BY EmployeeName";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Office Employees Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Brgy Employees By Barangay (✓)
router.get("/getEmployeesByBarangay/:brgyId", function (req, res) {
  let brgyId = req.params.brgyId;
  //Database Connection
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM BarangayOfficer WHERE BarangayId = " +
        brgyId +
        " ORDER BY BarangayOfficerName";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch All Barangay Employees Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Barangay List (✓)
router.get("/getBarangayList", function (req, res) {
  //Database Connection
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Barangay ORDER BY BarangayName";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Barangay Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Office List (✓)
router.get("/getOfficeList", function (req, res) {
  //Fetch Office List
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Office ORDER BY OfficeName";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Offices Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

module.exports = router;
