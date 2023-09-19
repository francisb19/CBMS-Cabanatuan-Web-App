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

//Fetch Suppliers (✓)
router.get("/getSuppliers", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Supplier ORDER BY SupplierName";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Suppliers Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Item Type (✓)
router.get("/getItemTypes", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM ItemType ORDER BY ItemType";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Item Types Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Units (✓)
router.get("/getUnits", function (req, res) {
  //Fetch Units
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Unit ORDER BY Unit";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Units Sucessfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Equipments (✓)
router.get("/getEquipments", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM EquipmentDetailsView WHERE CondemnStatus = 'Active' ORDER BY EquipmentId";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Equipments Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Condemned Equipments (✓)
router.get("/getCondemnedEquipments", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM EquipmentDetailsView WHERE CondemnStatus = 'Condemned' ORDER BY EquipmentId";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Condemned Equipments Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

module.exports = router;
