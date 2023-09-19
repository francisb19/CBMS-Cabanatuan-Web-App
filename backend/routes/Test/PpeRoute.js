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

//Get Ppe Id (✓)
router.get("/getPpeId/:propType/:recNo", async function (req, res) {
  let propType = parseInt(req.params.propType);
  let recNo = parseInt(req.params.recNo);
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM Ppe WHERE PropertyTypeId = " +
        propType +
        " AND PpeDetailsId = " +
        recNo +
        "";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        console.log("Fetch Ppe Id Successfully!");
        res.json(parseInt(result.recordset[0].RecordNo));
        sql.close();
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });
});

//Fetch Property Types (✓)
router.get("/getPropertyTypes", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM PropertyType ORDER BY RecordNo";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Property Types Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Account Codes
//Fetch Codes By Record No (✓)
router.get("/getCodeByRecordNo/:recordNo", function (req, res) {
  let recordNo = req.params.recordNo;
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT Code FROM AccountCode WHERE RecordNo = " + recordNo + "";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Code Successfully!");
      res.json(result.recordset[0].Code);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Step 1 Account Codes
router.get("/getAccountCodes", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM AccountCode WHERE Step = 1 ORDER BY RecordNo";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Step 1 Account Codes Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Account Codes By Step
router.get("/getAccountCodesByStep/:recordNo/:step", function (req, res) {
  let recordNo = req.params.recordNo;
  let step = req.params.step;
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM AccountCode WHERE Step = " +
        step +
        " AND Upper = " +
        recordNo +
        " ORDER BY RecordNo";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Account Codes By Step Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Condemn Details (✓)
router.get("/getCondemnDetails/:ppeId", function (req, res) {
  let ppeId = parseInt(req.params.ppeId);
  //Fetch Condemn Details
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM CondemnDetailsView WHERE PpeId = " + ppeId + "";
      console.log(query);
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Condemn Details Successfully!");
      res.json(result.recordset[0]);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Details by PpeId and PropertyType
router.get("/getItemDetails/:propType/:ppeId", function (req, res) {
  let propType = parseInt(req.params.propType);
  let ppeId = parseInt(req.params.ppeId);

  if (propType === 2) {
    //Fetch Equipments
    new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM EquipmentDetailsView WHERE CondemnStatus = 'Active' AND PpeId = " +
          ppeId +
          " ORDER BY PropertyNo";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log("Fetch Equipment Details Successfully!");
        res.json(result.recordset[0]);
        sql.close();
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  } else if (propType === 5) {
    //Fetch Transportation
    new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM VehicleDetailsView WHERE CondemnStatus = 'Active' WHERE PpeId = " +
          ppeId +
          " ORDER BY VehicleId";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log("Fetch Transportation Details Successfully!");
        res.json(result.recordset[0]);
        sql.close();
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  }
});

module.exports = router;
