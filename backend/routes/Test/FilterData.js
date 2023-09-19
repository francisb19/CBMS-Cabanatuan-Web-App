var express = require("express");
var sql = require("mssql/msnodesqlv8");
var moment = require("moment");

const router = express.Router();

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

//Table Filters
//Fetch Buildings By Month and Year Acquired (✓)
router.get(
  "/getBuildingsByMonthAndYearAcquired/:month/:year",
  function (req, res) {
    let month = parseInt(req.params.month);
    let year = parseInt(req.params.year);
    //Fetch Buildings
    new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT BuildingDetailsView WHERE onthAcquired = '" +
          month +
          "' AND YearAcquired = '" +
          year +
          "'  ORDER BY ItemNo ";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log("Fetch Buildings By Month and Year Acquired Successfully!");
        res.json(result.recordset);
        sql.close();
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  }
);

//Fetch Buildings By Year Acquired (✓)
router.get("/getBuildingsByYearAcquired/:year", function (req, res) {
  let year = parseInt(req.params.year);
  //Fetch Buildings
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM BuildingDetailsView WHERE YearAcquired = '" +
        year +
        "'  ORDER BY ItemNo ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Buildings By Year Acquired Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Buildings By Month and Year Completed (✓)
router.get(
  "/getBuildingsByMonthAndYearCompleted/:month/:year",
  function (req, res) {
    let month = parseInt(req.params.month);
    let year = parseInt(req.params.year);
    //Fetch Buildings
    new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM BuildingDetailsView WHERE MonthCompleted = '" +
          month +
          "' AND YearCompleted = '" +
          year +
          "'  ORDER BY ItemNo ";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log(
          "Fetch Buildings By Month and Year Completed Successfully!"
        );
        res.json(result.recordset);
        sql.close();
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  }
);

//Fetch Buildings By Year Completed (✓)
router.get("/getBuildingsByYearCompleted/:year", function (req, res) {
  let year = parseInt(req.params.year);
  //Fetch Buildings
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECTSELECT * FROM BuildingDetailsView WHERE YearCompleted = '" +
        year +
        "'  ORDER BY ItemNo ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Buildings By Year Completed Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Buildings By Month and Year Started (✓)
router.get(
  "/getBuildingsByMonthAndYearStarted/:month/:year",
  function (req, res) {
    let month = parseInt(req.params.month);
    let year = parseInt(req.params.year);
    //Fetch Buildings
    new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM BuildingDetailsView WHERE MonthStarted = '" +
          month +
          "' AND YearStarted = '" +
          year +
          "'  ORDER BY ItemNo ";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log("Fetch Buildings By Month and Year Started Successfully!");
        res.json(result.recordset);
        sql.close();
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  }
);

//Fetch Buildings By Year Started (✓)
router.get("/getBuildingsByYearStarted/:year", function (req, res) {
  let year = parseInt(req.params.year);
  //Fetch Buildings
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM BuildingDetailsView WHERE YearStarted = '" +
        year +
        "'  ORDER BY ItemNo ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Buildings By Year Started Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Equipments By Supplier (✓)
router.get("/getEquipmentsBySupplier/:supplierId", function (req, res) {
  let supplierId = parseInt(req.params.supplierId);
  //Fetch Equipments
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM EquipmentDetailsView WHERE SupplierId = " +
        supplierId +
        "  ORDER BY PropertyNo ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Equipments By Supplier Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Equipments By Office (✓)
router.get("/getEquipmentsByOffice/:officeId", function (req, res) {
  let officeId = parseInt(req.params.officeId);
  //Fetch Equipments
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM EquipmentDetailsView WHERE CurrentOfficeId = " +
        officeId +
        "  ORDER BY PropertyNo ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Equipments By Office Sucessfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Equipments By Month and Year Acquired (✓)
router.get(
  "/getEquipmentsByMonthAndYearAcquired/:month/:year",
  function (req, res) {
    let month = parseInt(req.params.month);
    let year = parseInt(req.params.year);
    //Fetch Equipments
    new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM EquipmentDetailsView WHERE MonthAcquired = '" +
          month +
          "' AND YearAcquired = '" +
          year +
          "'  ORDER BY PropertyNo ";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log("Fetch Equipments By Month and Year Successfully!");
        res.json(result.recordset);
        sql.close();
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  }
);

//Fetch Equipments By Year Acquired(✓)
router.get("/getEquipmentsByYearAcquired/:year", function (req, res) {
  let year = parseInt(req.params.year);
  //Fetch Equipments
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM EquipmentDetailsView WHERE YearAcquired = '" +
        year +
        "'  ORDER BY PropertyNo ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Equipments By Year Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Infrastructure Assets By Month and Year Acquired (✓)
router.get(
  "/getInfrastructureAssetsByMonthAndYearAcquired/:month/:year",
  function (req, res) {
    let month = parseInt(req.params.month);
    let year = parseInt(req.params.year);
    //Fetch Infrastructure Assets
    new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM InfrastructureAssetDetailsView WHERE MonthAcquired = '" +
          month +
          "' AND YearAcquired = '" +
          year +
          "'  ORDER BY InfrastructureAssetId ";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log(
          "Fetch Infrastructure Assets By Month and Year Acquired Successfully!"
        );
        res.json(result.recordset);
        sql.close();
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  }
);

//Fetch Infrastructure Assets By Year Acquired (✓)
router.get("/getInfrastructureAssetsByYearAcquired/:year", function (req, res) {
  let year = parseInt(req.params.year);
  //Fetch Infrastructure Assets
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM InfrastructureAssetDetailsView WHERE YearAcquired = '" +
        year +
        "'  ORDER BY InfrastructureAssetId ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Infrastructure Assets By Year Acquired Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Lands By Month and Year Acquired (✓)
router.get("/getLandsByMonthAndYearAcquired/:month/:year", function (req, res) {
  let month = parseInt(req.params.month);
  let year = parseInt(req.params.year);
  //Fetch Lands
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM LandDetailsView WHERE MonthAcquired = '" +
        month +
        "' AND YearAcquired = '" +
        year +
        "'  ORDER BY LandId ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Lands By Month and Year Acquired Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Lands By Year Acquired (✓)
router.get("/getLandsByYearAcquired/:year", function (req, res) {
  let year = parseInt(req.params.year);
  //Fetch Lands
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM LandDetailsView WHERE YearAcquired = '" +
        year +
        "'  ORDER BY LandId ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Lands By Year Acquired Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Lands By Location (✓)
router.get("/getLandsByLocation/:locationId", function (req, res) {
  let locationId = parseInt(req.params.locationId);
  //Fetch Lands
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM LandDetailsView WHERE LocationId = '" +
        locationId +
        "'  ORDER BY LandId ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Lands By Location Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Lands By Land Type Classification (✓)
router.get(
  "/getLandsByLandTypeClassification/:landTypeClassificationId",
  function (req, res) {
    let landTypeClassificationId = parseInt(
      req.params.landTypeClassificationId
    );
    //Fetch Lands
    new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM LandDetailsView WHERE LandTypeId = '" +
          landTypeClassificationId +
          "'  ORDER BY LandId";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log("Fetch Lands By Land Type Classification Successfully!");
        res.json(result.recordset);
        sql.close();
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  }
);

//Fetch Vehicle By Month and Year Acquired (✓)
router.get(
  "/getVehiclesByMonthAndYearAcquired/:month/:year",
  function (req, res) {
    let month = parseInt(req.params.month);
    let year = parseInt(req.params.year);
    //Fetch Vehicle
    new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM VehicleDetailsView WHERE MonthAcquired = '" +
          month +
          "' AND YearAcquired = '" +
          year +
          "'  ORDER BY VehicleId";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log("Fetch Vehicle By Month and Year Acquired Successfully!");
        res.json(result.recordset);
        sql.close();
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  }
);

//Fetch Vehicle By Year Acquired (✓)
router.get("/getVehiclesByYearAcquired/:year", function (req, res) {
  let year = parseInt(req.params.year);
  //Fetch Vehicle
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM VehicleDetailsView WHERE YearAcquired = '" +
        year +
        "'  ORDER BY VehicleId ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Vehicle By Year Acquired Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Vehicle By Vehicle Type (✓)
router.get("/getVehiclesByVehicleType/:VehicleTypeId", function (req, res) {
  let VehicleTypeId = parseInt(req.params.VehicleTypeId);
  //Fetch Vehicle
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM VehicleDetailsView WHERE VehicleTypeId = '" +
        VehicleTypeId +
        "' ORDER BY VehicleId";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Vehicle By Vehicle Type Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Vehicle By Vehicle Model (✓)
router.get("/getVehiclesByVehicleModel/:vehicleModelId", function (req, res) {
  let vehicleModelId = parseInt(req.params.vehicleModelId);
  //Fetch Vehicle
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM VehicleDetailsView WHERE VehicleModelId = '" +
        vehicleModelId +
        "' ORDER BY VehicleId ";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Vehicle By Vehicle Model Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Vehicle By Heave Equipment Type (✓)
router.get(
  "/getVehiclesByHeavyEquipmentType/:heavyEquipmentTypeId",
  function (req, res) {
    let heavyEquipmentTypeId = parseInt(req.params.heavyEquipmentTypeId);
    //Fetch Vehicle
    new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM VehicleDetailsView WHERE HeavyEquipmentTypeId = '" +
          heavyEquipmentTypeId +
          "' ORDER BY VehicleId";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log("Fetch Vehicle By Heavy Equipment Type Successfully!");
        res.json(result.recordset);
        sql.close();
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  }
);

module.exports = router;
