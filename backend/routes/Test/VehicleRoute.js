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

//Fetch Vehicle Types (✓)
router.get("/getVehicleTypes", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM VehicleType ORDER BY VehicleType";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Vehicle Types Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Vehicle Models (✓)
router.get("/getVehicleModels", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM VehicleModel ORDER BY Model";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Vehicle Models Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Heavy Equipment Types (✓)
router.get("/getHeavyEquipmentTypes", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM HeavyEquipmentType ORDER BY HeavyEquipment";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Heavy Equipment Types Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Condition (✓)
router.get("/getCondition", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Condition ORDER BY Condition";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Condition Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Colors (✓)
router.get("/getColors", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Color ORDER BY Color";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Colors Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Status Of Documents (✓)
router.get("/getStatusOfDocuments", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM StatusOfDocument ORDER BY StatusOfDocument";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Status of Documents Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Vehicles (✓)
router.get("/getVehicles", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM VehicleDetailsView WHERE CondemnStatus = 'Active' ORDER BY VehicleId";
      console.log(query);
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Vehicle Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Condemned Vehicles (✓)
router.get("/getCondemnedVehicles", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM VehicleDetailsView WHERE CondemnStatus = 'Condemned' ORDER BY VehicleId";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Condemned Vehicles Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

module.exports = router;
