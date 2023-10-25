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
        "SELECT BarangayName as choice, BarangayCode as id FROM Barangay ORDER BY BarangayName";
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

//Fetch Structures By Barangay
router.get("/getStructuresByBarangay/:brgy", async function (req, res) {
  let barangay = req.params.brgy;
  if (barangay !== "99") {
    //Get Structures
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT OID as id, GeotagId, DateTagged, Latitude, Longitude, LocationPhoto, Photo, BarangayName AS Barangay, BarangayCode, PurokName AS Purok, UseCode AS BuildingUse, BuildingTypeName AS BuildingType, NoOfFloor, ConstructionMaterial, TabletNo, TeamTablet AS Team, Remarks FROM StructureDetail WHERE BarangayCode = '" +
          barangay +
          "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Fetch Structures Successfully!");
        await res.json(result.recordset);
        await sql.close();
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  } else {
    //Get Structures
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT OID as id, GeotagId, DateTagged, Latitude, Longitude, LocationPhoto, Photo, BarangayName AS Barangay, BarangayCode, PurokName AS Purok, UseCode AS BuildingUse, BuildingTypeName AS BuildingType, NoOfFloor, ConstructionMaterial, TabletNo, TeamTablet AS Team, Remarks FROM StructureDetail";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Fetch All Structures Successfully!");
        await res.json(result.recordset);
        await sql.close();
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  }
});

//Fetch Household Count By Barangay
router.get("/getHouseholdCountByBarangay/:brgy", async function (req, res) {
  let barangay = req.params.brgy;
  if (barangay !== "99") {
    //Get Structures
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT OID FROM HouseholdDetail WHERE BarangayCode = '" +
          barangay +
          "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Fetch Household Count Successfully!");
        await res.json(result.recordset.length);
        await sql.close();
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  } else {
    //Get Structures
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query = "SELECT OID FROM HouseholdDetail";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Fetch Household Count Successfully!");
        await res.json(result.recordset.length);
        await sql.close();
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  }
});

module.exports = router;
