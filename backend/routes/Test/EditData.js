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

const getOfficeName = async (location, office) => {
  let officeName;
  if (location === 1) {
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query = "SELECT * FROM Barangay WHERE RecordNo = " + office + "";
        return pool.request().query(query);
      })
      .then(async (result) => {
        officeName = await result.recordset[0].BarangayName;
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  } else if (location === 2) {
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query = "SELECT * FROM Office WHERE RecordNo = " + office + "";
        return pool.request().query(query);
      })
      .then(async (result) => {
        officeName = await result.recordset[0].OfficeName;
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  }
  return await officeName;
};

const toFullDate = async (month, day, year) => {
  let monthText, comma;
  if (month === "" || month === null || month === undefined) {
    monthText = "";
  } else {
    //Prop No Check
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query = "SELECT * FROM Month WHERE RecordNo = '" + month + "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        monthText = await result.recordset[0].Month;
        monthText = `${monthText} `;
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  }

  if (day === "" || day === null || day === undefined) {
    day = "";
  }

  if (
    day !== "" &&
    day !== null &&
    day !== undefined &&
    year !== "" &&
    year !== null &&
    year !== undefined
  ) {
    comma = ", ";
  } else {
    comma = "";
  }
  return `${monthText}${day}${comma}${year}`;
};

const getUsername = async (userId) => {
  let username;
  //Prop No Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM UserList WHERE RecordNo = " + userId + "";
      return pool.request().query(query);
    })
    .then(async (result) => {
      username = await result.recordset[0].Username;
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  return username;
};

//Update User Status (✓)
router.post("/editUserStatus", async function (req, res) {
  let status;
  let recordNo = req.body.data;

  //Status Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM UserList WHERE RecordNo = " + recordNo + "";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset[0].isActive === true) {
        status = await 0;
      } else {
        status = await 1;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //Update User Status
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "UPDATE UserList SET isActive = " +
        status +
        " WHERE RecordNo = " +
        recordNo +
        "";
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log("Edit User Status Successfully!");
      await res.json(0);
      await sql.close();
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });
});

//Update Building Details (✓)
router.post("/editBuildingItem", async function (req, res) {
  let buildingCheck, ppeId;
  let oldRecNo = req.body.data.oldRecNo;
  let itemNo = req.body.data.itemNo;
  itemNo = itemNo.replace(/'/g, "''");
  let description = req.body.data.description;
  description = description.replace(/'/g, "''");
  let estimatedLife = req.body.data.estimatedLife;
  estimatedLife = parseInt(estimatedLife);
  let acquisitionCost = req.body.data.acquisitionCost;
  acquisitionCost = parseFloat(acquisitionCost).toFixed(2);
  let remarks = req.body.data.remarks;
  remarks = remarks.replace(/'/g, "''");

  let monthAcquired = req.body.data.monthAcquired;
  let dayAcquired = req.body.data.dayAcquired;
  let yearAcquired = req.body.data.yearAcquired;
  fullDateAcquired = await toFullDate(monthAcquired, dayAcquired, yearAcquired);

  let monthCompleted = req.body.data.monthCompleted;
  let dayCompleted = req.body.data.dayCompleted;
  let yearCompleted = req.body.data.yearCompleted;
  fullDateCompleted = await toFullDate(
    monthCompleted,
    dayCompleted,
    yearCompleted
  );

  let monthStarted = req.body.data.monthStarted;
  let dayStarted = req.body.data.dayStarted;
  let yearStarted = req.body.data.yearStarted;
  fullDateStarted = await toFullDate(monthStarted, dayStarted, yearStarted);

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let propertyTypeId = 1;

  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation = 1;
  let activityTypeId = 2;
  let auditTrailText = `Edited by user ${username}.`;

  //Get Ppe Details Id
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM Ppe WHERE PropertyTypeId = " +
        propertyTypeId +
        " AND PpeDetailsId = '" +
        oldRecNo +
        "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        ppeId = result.recordset[0].RecordNo;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //Item No. Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Building WHERE ItemNo = '" + itemNo + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        if (result.recordset[0].RecordNo === oldRecNo) {
          buildingCheck = true;
        } else {
          buildingCheck = false;
        }
      } else {
        buildingCheck = true;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (buildingCheck) {
    //Building Update
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE Building SET ItemNo = " +
          itemNo +
          ", Description = '" +
          description +
          "', EstimatedLife = " +
          estimatedLife +
          ", AcquisitionCost = " +
          acquisitionCost +
          ", Remarks = '" +
          remarks +
          "', MonthAcquired = '" +
          monthAcquired +
          "', YearAcquired = '" +
          yearAcquired +
          "', DayAcquired = '" +
          dayAcquired +
          "', FullDateAcquired = '" +
          fullDateAcquired +
          "', MonthStarted = '" +
          monthStarted +
          "', YearStarted = '" +
          yearStarted +
          "', DayStarted = '" +
          dayStarted +
          "', FullDateStarted = '" +
          fullDateStarted +
          "', MonthCompleted = '" +
          monthCompleted +
          "', YearCompleted = '" +
          yearCompleted +
          "', DayCompleted = '" +
          dayCompleted +
          "', FullDateCompleted = '" +
          fullDateCompleted +
          "' WHERE RecordNo = '" +
          oldRecNo +
          "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Edit Building Process Successful!");
        await res.json(0);
        await sql.close();
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Update Date Acquired
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE ItemHistory SET MonthOfTransaction = '" +
          monthAcquired +
          "', DayOfTransaction = '" +
          dayAcquired +
          "', YearOfTransaction = '" +
          yearAcquired +
          "', FullDateOfTransaction = '" +
          fullDateAcquired +
          "' WHERE PpeId = " +
          ppeId +
          " AND TransactionTypeId = 1";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Date Acquired Updated Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Update Date Started
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE ItemHistory SET MonthOfTransaction = '" +
          monthStarted +
          "', DayOfTransaction = '" +
          dayStarted +
          "', YearOfTransaction = '" +
          yearStarted +
          "', FullDateOfTransaction = '" +
          fullDateStarted +
          "' WHERE PpeId = " +
          ppeId +
          " AND TransactionTypeId = 2";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Date Started Updated Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Update Date Completed
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE ItemHistory SET MonthOfTransaction = '" +
          monthCompleted +
          "', DayOfTransaction = '" +
          dayCompleted +
          "', YearOfTransaction = '" +
          yearCompleted +
          "', FullDateOfTransaction = '" +
          fullDateCompleted +
          "' WHERE PpeId = " +
          ppeId +
          " AND TransactionTypeId = 3";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Date Completed Updated Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Audit Trail Add (For Edit)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO AuditTrail (ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
          activityLocation +
          ", " +
          ppeId +
          ", " +
          activityTypeId +
          ", '" +
          auditTrailText +
          "', " +
          userId +
          ", '" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Audit Trail (For Edit) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  } else {
    await res.json(1);
    await sql.close();
  }
});

//Update Infrastructure Asset Details (✓)
router.post("/editInfrastructureAsset", async function (req, res) {
  let infrastructureCheck, ppeId;
  let oldRecNo = req.body.data.oldRecNo;
  let roadNetworkId = req.body.data.roadNetworkId;
  roadNetworkId = roadNetworkId.replace(/'/g, "''");
  let name = req.body.data.name;
  name = name.replace(/'/g, "''");
  let component = req.body.data.component;
  component = component.replace(/'/g, "''");
  let reference = req.body.data.reference;
  reference = reference.replace(/'/g, "''");
  let cost = req.body.data.cost;
  cost = parseFloat(cost).toFixed(2);
  let remarks = req.body.data.remarks;

  let monthAcquired = req.body.data.monthAcquired;
  let dayAcquired = req.body.data.dayAcquired;
  let yearAcquired = req.body.data.yearAcquired;
  fullDateAcquired = await toFullDate(monthAcquired, dayAcquired, yearAcquired);

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let propertyTypeId = 3;

  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation = 1;
  let activityTypeId = 2;
  let auditTrailText = `Edited by user ${username}.`;

  //Get Ppe Details Id
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM Ppe WHERE PropertyTypeId = " +
        propertyTypeId +
        " AND PpeDetailsId = '" +
        oldRecNo +
        "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        ppeId = result.recordset[0].RecordNo;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //Road Network Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM InfrastructureAsset WHERE RoadNetworkId = '" +
        roadNetworkId +
        "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        if (result.recordset[0].RecordNo === oldRecNo) {
          infrastructureCheck = true;
        } else {
          infrastructureCheck = false;
        }
      } else {
        infrastructureCheck = true;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (infrastructureCheck) {
    //Update Infrastructure
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE InfrastructureAsset SET RoadNetworkId = '" +
          roadNetworkId +
          "', Name = '" +
          name +
          "', Component = '" +
          component +
          "', MonthAcquired = '" +
          monthAcquired +
          "', DayAcquired = '" +
          dayAcquired +
          "', YearAcquired = '" +
          yearAcquired +
          "', FullDateAcquired = '" +
          fullDateAcquired +
          "', Cost = " +
          cost +
          ", Remarks = '" +
          remarks +
          "' WHERE RecordNo = " +
          oldRecNo +
          " ";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Updated Infrastructure Assets Successfully!");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Update Date Acquired
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE ItemHistory SET MonthOfTransaction = '" +
          monthAcquired +
          "', DayOfTransaction = '" +
          dayAcquired +
          "', YearOfTransaction = '" +
          yearAcquired +
          "', FullDateOfTransaction = '" +
          fullDateAcquired +
          "' WHERE PpeId = " +
          ppeId +
          " AND TransactionTypeId = 1";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Date Acquired Updated Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Audit Trail Add (For Edit)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO AuditTrail (ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
          activityLocation +
          ", " +
          ppeId +
          ", " +
          activityTypeId +
          ", '" +
          auditTrailText +
          "', " +
          userId +
          ", '" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Audit Trail (For Edit) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    await console.log("Edit Infrastructure Assets Process Successful!");
    await res.json(0);
    await sql.close();
  } else {
    await res.json(1);
    await sql.close();
  }
});

//Update Land Details (✓)
router.post("/editLand", async function (req, res) {
  let landCheck,
    statusOfDocumentAdd,
    newStatusOfDocumentId,
    titleOwnerAdd,
    newTitleOwnerId,
    fullDateAcquired,
    ppeId;
  newTitleOwnerId;
  let oldRecNo = req.body.data.oldRecNo;
  let tctNo = req.body.data.tctNo;
  tctNo = tctNo.replace(/'/g, "''");
  let locationId = req.body.data.location;
  let landType = req.body.data.landType;
  let utilizedAs = req.body.data.utilizedAs;
  utilizedAs = utilizedAs.replace(/'/g, "''");
  let titleOwner = req.body.data.titleOwner;
  titleOwner = titleOwner.replace(/'/g, "''");
  let statusOfDocument = req.body.data.statusOfDocument;
  statusOfDocument = statusOfDocument.replace(/'/g, "''");

  let fund = req.body.data.fund;
  fund = fund.replace(/'/g, "''");
  let area = req.body.data.area;
  area = area.replace(/'/g, "''");
  let remarks = req.body.data.remarks;
  remarks = remarks.replace(/'/g, "''");

  let monthAcquired = req.body.data.monthAcquired;
  let dayAcquired = req.body.data.dayAcquired;
  let yearAcquired = req.body.data.yearAcquired;
  fullDateAcquired = await toFullDate(monthAcquired, dayAcquired, yearAcquired);

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let propertyTypeId = 4;

  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation = 1;
  let activityTypeId = 2;
  let auditTrailText = `Edited by user ${username}.`;

  //Get Ppe Details Id
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM Ppe WHERE PropertyTypeId = " +
        propertyTypeId +
        " AND PpeDetailsId = '" +
        oldRecNo +
        "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        ppeId = result.recordset[0].RecordNo;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //TCT No. Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Land WHERE TctNo = '" + tctNo + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        if (result.recordset[0].RecordNo === oldRecNo) {
          landCheck = true;
        } else {
          landCheck = false;
        }
      } else {
        landCheck = true;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (landCheck) {
    if (statusOfDocument === "" || statusOfDocument === null) {
      statusOfDocumentId = null;
      console.log("Status Of Document is Empty!");
    } else {
      //Status Of Document Check
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "SELECT * FROM StatusOfDocument WHERE StatusOfDocument = '" +
            statusOfDocument +
            "'";
          return pool.request().query(query);
        })
        .then(async (result) => {
          if (result.recordset.length === 0) {
            statusOfDocumentAdd = await true;
          } else {
            statusOfDocumentId = await result.recordset[0].RecordNo;
            await console.log("Status Of Document already inserted");
          }
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });
    }

    if (statusOfDocumentAdd) {
      //Status Of Document Add
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO StatusOfDocument (StatusOfDocument) VALUES('" +
            statusOfDocument +
            "') SELECT SCOPE_IDENTITY() as id";
          return pool.request().query(query);
        })
        .then(async (result) => {
          statusOfDocumentId = await result.recordset[0].id;
          await console.log("Status Of Document Added Successfully");
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });
    }

    if (titleOwner === "" || titleOwner === null) {
      titleOwnerId = null;
      console.log("Title Owner is Empty!");
    } else {
      //Title Owner Check
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "SELECT * FROM TitleOwner WHERE TitleOwner = '" + titleOwner + "'";
          return pool.request().query(query);
        })
        .then(async (result) => {
          if (result.recordset.length === 0) {
            titleOwnerAdd = await true;
          } else {
            titleOwnerId = await result.recordset[0].RecordNo;
            await console.log("Title Owner already inserted");
          }
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });
    }

    if (titleOwnerAdd) {
      //Title Owner Add
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO TitleOwner (TitleOwner) VALUES('" +
            titleOwner +
            "') SELECT SCOPE_IDENTITY() as id";
          return pool.request().query(query);
        })
        .then(async (result) => {
          titleOwnerId = await result.recordset[0].id;
          await console.log("Title Owner Added Successfully");
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });
    }

    //Update Land
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE Land SET TctNo = '" +
          tctNo +
          "' ,LandTypeId = " +
          landType +
          " ,LocationId = " +
          locationId +
          " ,Area = '" +
          area +
          "' ,UtilizedAs = '" +
          utilizedAs +
          "' ,TitleOwnerId = " +
          newTitleOwnerId +
          " ,StatusOfDocumentId = " +
          newStatusOfDocumentId +
          " ,Fund = '" +
          fund +
          "' ,Remarks = '" +
          remarks +
          "', MonthAcquired = '" +
          monthAcquired +
          "' ,DayAcquired = '" +
          dayAcquired +
          "' ,YearAcquired = '" +
          yearAcquired +
          "' ,FullDateAcquired = '" +
          fullDateAcquired +
          "' ,FullDateAdded = '" +
          fullDateAdded +
          "'  WHERE RecordNo = " +
          oldRecNo +
          "";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Land Edited Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Update Date Acquired
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE ItemHistory SET MonthOfTransaction = '" +
          monthAcquired +
          "', DayOfTransaction = '" +
          dayAcquired +
          "', YearOfTransaction = '" +
          yearAcquired +
          "', FullDateOfTransaction = '" +
          fullDateAcquired +
          "' WHERE PpeId = " +
          ppeId +
          " AND TransactionTypeId = 1";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Date Acquired Updated Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Audit Trail Add (For Edit)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO AuditTrail (ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
          activityLocation +
          ", " +
          ppeId +
          ", " +
          activityTypeId +
          ", '" +
          auditTrailText +
          "', " +
          userId +
          ", '" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Audit Trail (For Edit) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    await console.log("Edit Land Process Successful!");
    await res.json(0);
    await sql.close();
  } else {
    await res.json(1);
    await sql.close();
  }
});

//Update Vehicle Details (✓)
router.post("/editVehicle", async function (req, res) {
  let vehicleModelAdd,
    vehicleModelId,
    heavyEquipAdd,
    heavyEquipId,
    colorAdd,
    colorId,
    statusOfDocumentAdd,
    statusOfDocumentId,
    equipCodeCheck,
    plateNoCheck,
    vehicleNoCheck,
    oldEquipCode,
    oldPlateNo,
    oldVehicleNo,
    ppeId;
  let remarks = req.body.data.remarks;
  let oldRecNo = req.body.data.oldRecNo;
  let vehicleTypeId = req.body.data.vehicleTypeId;
  let quantity = req.body.data.quantity;
  quantity = parseInt(quantity);
  let vehicleModel = req.body.data.vehicleModel;
  vehicleModel = vehicleModel.replace(/'/g, "''");
  let heavyEquipmentType = req.body.data.heavyEquipmentType;
  if (heavyEquipmentType === null || heavyEquipmentType === "") {
  } else {
    heavyEquipmentType = heavyEquipmentType.replace(/'/g, "''");
  }
  let equipmentCode = req.body.data.equipmentCode;
  equipmentCode = equipmentCode.replace(/'/g, "''");
  let vehicleNo = req.body.data.vehicleNo;
  vehicleNo = vehicleNo.replace(/'/g, "''");
  let propertyNo = req.body.data.propertyNo;
  propertyNo = propertyNo.replace(/'/g, "''");
  let condStickerNo = req.body.data.condStickerNo;
  condStickerNo = condStickerNo.replace(/'/g, "''");
  let plateNo = req.body.data.plateNo;
  plateNo = plateNo.replace(/'/g, "''");
  let mvFileNo = req.body.data.mvFileNo;
  mvFileNo = mvFileNo.replace(/'/g, "''");
  let crNo = req.body.data.crNo;
  crNo = crNo.replace(/'/g, "''");
  let engineNo = req.body.data.engineNo;
  engineNo = engineNo.replace(/'/g, "''");
  let chassisNo = req.body.data.chassisNo;
  chassisNo = chassisNo.replace(/'/g, "''");
  let color = req.body.data.color;
  if (color === null || color === "") {
  } else {
    color = color.replace(/'/g, "''");
  }
  let statusOfDocument = req.body.data.statusOfDocument;
  if (statusOfDocument === null || statusOfDocument === "") {
  } else {
    statusOfDocument = statusOfDocument.replace(/'/g, "''");
  }
  let policyNo = req.body.data.policyNo;
  policyNo = policyNo.replace(/'/g, "''");
  let insuranceValidityUntil = req.body.data.insuranceValidityUntil;
  let dateOfLastLtoReceipt = req.body.data.dateOfLastLtoReceipt;
  let cost = req.body.data.cost;
  cost = parseFloat(cost).toFixed(2);
  let presentConditionId = req.body.data.presentConditionId;
  let conditionAsOf = req.body.data.conditionAsOf;

  let monthAcquired = req.body.data.monthAcquired;
  let dayAcquired = req.body.data.dayAcquired;
  let yearAcquired = req.body.data.yearAcquired;
  fullDateAcquired = await toFullDate(monthAcquired, dayAcquired, yearAcquired);

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let propertyTypeId = 5;

  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation = 1;
  let activityTypeId = 2;
  let auditTrailText = `Edited by user ${username}.`;

  //Get Ppe Details Id
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM Ppe WHERE PropertyTypeId = " +
        propertyTypeId +
        " AND PpeDetailsId = '" +
        oldRecNo +
        "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        ppeId = result.recordset[0].RecordNo;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //Equipment Code Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Vehicle WHERE RecordNo = " + oldRecNo + "";
      return pool.request().query(query);
    })
    .then(async (result) => {
      oldEquipCode = result.recordset[0].EquipmentCode;
      oldPlateNo = result.recordset[0].PlateNo;
      oldVehicleNo = result.recordset[0].VehicleNo;
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (equipmentCode !== "") {
    //Equipment Code Check
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM Vehicle WHERE EquipmentCode = '" + equipmentCode + "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        if (result.recordset.length === 0) {
          equipCodeCheck = await true;
        } else {
          if (result.recordset[0].EquipmentCode === oldEquipCode) {
            equipCodeCheck = await true;
          } else {
            equipCodeCheck = await false;
            await console.log("Equipment Code Already Used");
          }
        }
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  } else {
    equipCodeCheck = await true;
  }

  if (vehicleNo !== "") {
    //Vehicle No Check
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM Vehicle WHERE VehicleNo = '" + vehicleNo + "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        if (result.recordset.length === 0) {
          vehicleNoCheck = await true;
        } else {
          if (result.recordset[0].VehicleNo === oldVehicleNo) {
            vehicleNoCheck = await true;
          } else {
            vehicleNoCheck = await false;
            await console.log("Vehicle No. Already Used");
          }
        }
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  } else {
    vehicleNoCheck = await true;
  }

  if (plateNo !== "") {
    //Equipment Code Check
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query = "SELECT * FROM Vehicle WHERE PlateNo = '" + plateNo + "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        if (result.recordset.length === 0) {
          plateNoCheck = await true;
        } else {
          if (result.recordset[0].PlateNo === oldPlateNo) {
            plateNoCheck = await true;
          } else {
            plateNoCheck = await false;
            await console.log("Plate No. Already Used");
          }
        }
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  } else {
    plateNoCheck = await true;
  }

  if (
    equipCodeCheck === false ||
    vehicleNoCheck === false ||
    plateNoCheck === false
  ) {
    if (
      equipCodeCheck === false &&
      vehicleNoCheck === false &&
      plateNoCheck === false
    ) {
      await res.json(1); //All are used
      await sql.close();
    } else if (
      equipCodeCheck === false &&
      vehicleNoCheck === true &&
      plateNoCheck === true
    ) {
      await res.json(2); //Only equipment code is used
      await sql.close();
    } else if (
      equipCodeCheck === true &&
      vehicleNoCheck === false &&
      plateNoCheck === true
    ) {
      await res.json(3); //Only vehicle no is used
      await sql.close();
    } else if (
      equipCodeCheck === true &&
      vehicleNoCheck === true &&
      plateNoCheck === false
    ) {
      await res.json(4); //Only plate no is used
      await sql.close();
    } else if (
      equipCodeCheck === false &&
      vehicleNoCheck === false &&
      plateNoCheck === true
    ) {
      await res.json(5); //equip code and vehicle no is used
      await sql.close();
    } else if (
      equipCodeCheck === true &&
      vehicleNoCheck === false &&
      plateNoCheck === false
    ) {
      await res.json(6); //vehicle no and plate no is used
      await sql.close();
    } else if (
      equipCodeCheck === false &&
      vehicleNoCheck === true &&
      plateNoCheck === false
    ) {
      await res.json(7); //equip code and plate no is used
      await sql.close();
    }
  } else {
    //Vehicle Model Check
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM VehicleModel WHERE Model = '" + vehicleModel + "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        if (result.recordset.length === 0) {
          vehicleModelAdd = await true;
        } else {
          await console.log("Vehicle Model already inserted");
          vehicleModelId = await result.recordset[0].RecordNo;
        }
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    if (vehicleModelAdd) {
      //Vehicle Model Add
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO VehicleModel (Model) VALUES('" +
            vehicleModel +
            "') SELECT SCOPE_IDENTITY() as id";
          return pool.request().query(query);
        })
        .then(async (result) => {
          vehicleModelId = await result.recordset[0].id;
          await console.log("Vehicle Model Added Successfully");
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });
    }

    if (heavyEquipmentType === "" || heavyEquipmentType === null) {
      heavyEquipId = null;
      console.log("Heavy Equipment Type is Empty!");
    } else {
      //Heavy Equipment Check
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "SELECT * FROM HeavyEquipmentType WHERE HeavyEquipment = '" +
            heavyEquipmentType +
            "'";
          return pool.request().query(query);
        })
        .then(async (result) => {
          if (result.recordset.length === 0) {
            heavyEquipAdd = await true;
          } else {
            await console.log("Heavy Equipment Type already inserted");
            heavyEquipId = await result.recordset[0].RecordNo;
          }
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });

      if (heavyEquipAdd) {
        //Heavy Equipment Add
        await new sql.ConnectionPool(DBConfig)
          .connect()
          .then((pool) => {
            // Query
            let query =
              "INSERT INTO HeavyEquipmentType (HeavyEquipment) VALUES('" +
              heavyEquipmentType +
              "') SELECT SCOPE_IDENTITY() as id";
            return pool.request().query(query);
          })
          .then(async (result) => {
            heavyEquipId = await result.recordset[0].id;
            await console.log("Heavy Equipment Type Added Successfully");
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });
      }
    }

    if (color === "" || color === null) {
      colorId = null;
      console.log("Color is Empty!");
    } else {
      //Color Check
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query = "SELECT * FROM Color WHERE Color = '" + color + "'";
          return pool.request().query(query);
        })
        .then(async (result) => {
          if (result.recordset.length === 0) {
            colorAdd = await true;
          } else {
            await console.log("Color already inserted");
            colorId = await result.recordset[0].RecordNo;
          }
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });
      if (colorAdd) {
        //Color Add
        await new sql.ConnectionPool(DBConfig)
          .connect()
          .then((pool) => {
            // Query
            let query =
              "INSERT INTO Color (Color) VALUES('" +
              color +
              "') SELECT SCOPE_IDENTITY() as id";
            return pool.request().query(query);
          })
          .then(async (result) => {
            colorId = await result.recordset[0].id;
            await console.log("Color Added Successfully");
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });
      }
    }

    if (statusOfDocument === "" || statusOfDocument === null) {
      statusOfDocumentId = null;
      console.log("Status Of Document is Empty");
    } else {
      //Status Of Document Check
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "SELECT * FROM StatusOfDocument WHERE StatusOfDocument = '" +
            statusOfDocument +
            "'";
          return pool.request().query(query);
        })
        .then(async (result) => {
          if (result.recordset.length === 0) {
            statusOfDocumentAdd = await true;
          } else {
            await console.log("Status Of Document already inserted");
            statusOfDocumentId = await result.recordset[0].RecordNo;
          }
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });

      if (statusOfDocumentAdd) {
        //Status Of Document Add
        await new sql.ConnectionPool(DBConfig)
          .connect()
          .then((pool) => {
            // Query
            let query =
              "INSERT INTO StatusOfDocument (StatusOfDocument) VALUES('" +
              statusOfDocument +
              "') SELECT SCOPE_IDENTITY() as id";
            return pool.request().query(query);
          })
          .then(async (result) => {
            statusOfDocumentId = await result.recordset[0].id;
            await console.log("Status Of Document Added Successfully");
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });
      }
    }

    //Vehicle Update
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE Vehicle SET VehicleTypeId = " +
          vehicleTypeId +
          " ,HeavyEquipmentTypeId = " +
          heavyEquipId +
          " ,VehicleModelId = " +
          vehicleModelId +
          " ,Quantity = " +
          quantity +
          " ,EquipmentCode = '" +
          equipmentCode +
          "' ,VehicleNo = '" +
          vehicleNo +
          "' ,PropertyNo = '" +
          propertyNo +
          "' ,ConductionStickerNo = '" +
          condStickerNo +
          "' ,PlateNo = '" +
          plateNo +
          "' ,MvFileNo = '" +
          mvFileNo +
          "' ,CrNo = '" +
          crNo +
          "' ,EngineNo = '" +
          engineNo +
          "' ,ChassisNo = '" +
          chassisNo +
          "' ,ColorId = " +
          colorId +
          " ,StatusOfDocumentId = " +
          statusOfDocumentId +
          " ,PolicyNo = '" +
          policyNo +
          "' ,InsuranceValidityUntil = '" +
          insuranceValidityUntil +
          "' ,DateOfLastLtoReceipt = '" +
          dateOfLastLtoReceipt +
          "' ,MonthAcquired = '" +
          monthAcquired +
          "' ,DayAcquired = '" +
          dayAcquired +
          "' ,YearAcquired = '" +
          yearAcquired +
          "' ,FullDateAcquired = '" +
          fullDateAcquired +
          "' ,Cost = " +
          cost +
          " ,PresentConditionId = " +
          presentConditionId +
          " ,ConditionAsOf = '" +
          conditionAsOf +
          "' ,Remarks = '" +
          remarks +
          "' WHERE RecordNo = " +
          oldRecNo +
          "";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Edit Vehicle Successful!");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Update Date Acquired
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE ItemHistory SET MonthOfTransaction = '" +
          monthAcquired +
          "', DayOfTransaction = '" +
          dayAcquired +
          "', YearOfTransaction = '" +
          yearAcquired +
          "', FullDateOfTransaction = '" +
          fullDateAcquired +
          "' WHERE PpeId = " +
          ppeId +
          " AND TransactionTypeId = 1";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Date Acquired Updated Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Audit Trail Add (For Edit)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO AuditTrail (ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
          activityLocation +
          ", " +
          ppeId +
          ", " +
          activityTypeId +
          ", '" +
          auditTrailText +
          "', " +
          userId +
          ", '" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Audit Trail (For Edit) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    await console.log("Edit Vehicle Process Successful!");
    await res.json(0);
    await sql.close();
  }
});

//Update Equipment Details (✓)
router.post("/editEquipmentItem", async function (req, res) {
  let ppeId,
    fullDateAcquired,
    supplierAdd,
    itemTypeAdd,
    equipmentCheck,
    supplierId,
    itemTypeId;
  let oldRecNo = req.body.data.oldRecNo;
  let propNo = req.body.data.propNo;
  propNo = propNo.replace(/'/g, "''");
  let osNo = req.body.data.osNo;
  osNo = osNo.replace(/'/g, "''");
  let poNo = req.body.data.poNo;
  poNo = poNo.replace(/'/g, "''");
  let accountCode = req.body.data.accountCode;
  accountCode = accountCode.replace(/'/g, "''");
  let supplierName = req.body.data.supplierName;
  supplierName = supplierName.replace(/'/g, "''");
  let itemType = req.body.data.itemType;
  itemType = itemType.replace(/'/g, "''");
  let unitId = req.body.data.unitId;
  unitId = parseInt(unitId);
  let qty = req.body.data.qty;
  let unitCost = req.body.data.unitCost;
  unitCost = parseFloat(unitCost).toFixed(2);
  let totalAcquisition = req.body.data.totalAcquisition;
  let shelfLife = req.body.data.shelfLife;
  let description = req.body.data.description;
  description = description.replace(/'/g, "''");
  let serialNo = req.body.data.serialNo;
  serialNo = serialNo.replace(/'/g, "''");
  let remarks = req.body.data.remarks;
  remarks = remarks.replace(/'/g, "''");

  let monthAcquired = req.body.data.monthAcquired;
  let dayAcquired = req.body.data.dayAcquired;
  let yearAcquired = req.body.data.yearAcquired;
  fullDateAcquired = await toFullDate(monthAcquired, dayAcquired, yearAcquired);

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let propertyTypeId = 2;

  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation = 1;
  let activityTypeId = 2;
  let auditTrailText = `Edited by user ${username}.`;

  //Get Ppe Details Id
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM Ppe WHERE PropertyTypeId = " +
        propertyTypeId +
        " AND PpeDetailsId = " +
        oldRecNo +
        "";
      console.log(query);
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        ppeId = result.recordset[0].RecordNo;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //Prop No Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Equipment WHERE PropertyNo = '" + propNo + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        if (result.recordset[0].RecordNo === oldRecNo) {
          equipmentCheck = true;
        } else {
          equipmentCheck = false;
        }
      } else {
        equipmentCheck = true;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (equipmentCheck) {
    //Supplier Check
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM Supplier WHERE SupplierName = '" + supplierName + "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        if (result.recordset.length === 0) {
          supplierAdd = await true;
        } else {
          supplierId = await result.recordset[0].RecordNo;
          await console.log("Supplier ID Fetched Successfully");
        }
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    if (supplierAdd) {
      //Supplier Add
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO Supplier (SupplierName) VALUES('" +
            supplierName +
            "') SELECT SCOPE_IDENTITY() as supplierId";
          return pool.request().query(query);
        })
        .then(async (result) => {
          supplierId = await result.recordset[0].supplierId;
          await console.log("Supplier Added Successfully");
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });
    }

    //Item Type Check
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM ItemType WHERE ItemType = '" + itemType + "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        if (result.recordset.length === 0) {
          itemTypeAdd = await true;
        } else {
          itemTypeId = await result.recordset[0].RecordNo;
          await console.log("Item Type ID Fetched Successfully");
        }
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    if (itemTypeAdd) {
      //Item Type Add
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO ItemType (ItemType) VALUES('" +
            itemType +
            "') SELECT SCOPE_IDENTITY() as itemTypeId";
          return pool.request().query(query);
        })
        .then(async (result) => {
          itemTypeId = await result.recordset[0].itemTypeId;
          await console.log("Item Type Added Successfully");
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });
    }

    //Equipment Update
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE Equipment SET PropertyNo = '" +
          propNo +
          "', OsNo = '" +
          osNo +
          "', PoNo = '" +
          poNo +
          "', SupplierId = " +
          supplierId +
          ", Quantity = " +
          qty +
          ", UnitId = " +
          unitId +
          ", ItemId = " +
          itemTypeId +
          ", Description = '" +
          description +
          "', SerialNo = '" +
          serialNo +
          "', UnitCost = " +
          unitCost +
          ", TotalAcquisition = " +
          totalAcquisition +
          ",ShelfLife = '" +
          shelfLife +
          "', Remarks = '" +
          remarks +
          "', AccountCode = '" +
          accountCode +
          "', MonthAcquired = '" +
          monthAcquired +
          "', DayAcquired = '" +
          dayAcquired +
          "', YearAcquired = '" +
          yearAcquired +
          "', FullDateAcquired = '" +
          fullDateAcquired +
          "' WHERE RecordNo = " +
          oldRecNo +
          "";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Equipment Successfully Updated!");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Update Date Acquired
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE ItemHistory SET MonthOfTransaction = '" +
          monthAcquired +
          "', DayOfTransaction = '" +
          dayAcquired +
          "', YearOfTransaction = '" +
          yearAcquired +
          "', FullDateOfTransaction = '" +
          fullDateAcquired +
          "' WHERE PpeId = " +
          ppeId +
          " AND TransactionTypeId = 1";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Date Acquired Updated Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Audit Trail Add (For Edit)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO AuditTrail (ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
          activityLocation +
          ", " +
          ppeId +
          ", " +
          activityTypeId +
          ", '" +
          auditTrailText +
          "', " +
          userId +
          ", '" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Audit Trail (For Edit) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    await console.log("Edit Equipment Process Successful!");
    await res.json(0);
    await sql.close();
  } else {
    await res.json(1);
    await sql.close();
  }
});

//Update Ppe Details (✓)
router.post("/editPpeDetails", async function (req, res) {
  let ppeId;
  let recordNo = req.body.data.detailRecNo;
  let detail = req.body.data.detail;
  detail = detail.replace(/'/g, "''");

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation = 1;
  let activityTypeId = 2;
  let auditTrailText = `Additional detail has been edited by user ${username}.`;

  //Get Ppe Id
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM AdditionalDetail WHERE RecordNo = " + recordNo + "";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        ppeId = result.recordset[0].PpeId;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "UPDATE AdditionalDetail SET AdditionalDetail = '" +
        detail +
        "' WHERE RecordNo = " +
        recordNo +
        "";
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log("Additional Detail Updated Succesfully!");
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //Audit Trail Add (For Add)
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
        activityLocation +
        ", " +
        ppeId +
        ", " +
        activityTypeId +
        ", '" +
        auditTrailText +
        "', " +
        userId +
        ", '" +
        fullDateAdded +
        "')";
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log("Audit Trail (For Edit) Added Successfully");
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  await console.log("Edit Detail Process Successful!");
  await res.json(0);
  await sql.close();
});

//Update Transfer Details (✓)
router.post("/editTransfer", async function (req, res) {
  let transferDocumentId, transferDocumentState, existingItems;
  let propertyType = req.body.data.propertyType;
  let selectedItems = req.body.data.selectedItems;
  let oldRecNo = req.body.data.oldRecNo;
  let docNo = req.body.data.docNo;
  docNo = docNo.replace(/'/g, "''");
  let toLocation = req.body.data.toLocation;
  let fromLocation = req.body.data.fromLocation;
  let transferrerOffice = req.body.data.transferrerOffice;
  let receiverOffice = req.body.data.receiverOffice;
  let totalAmount = req.body.data.totalAmount;
  let toEmp = req.body.data.toEmp;
  let transferRemarks = req.body.data.transferRemarks;
  transferRemarks = transferRemarks.replace(/'/g, "''");
  let monthTransferred = req.body.data.monthTransferred;
  let dayTransferred = req.body.data.dayTransferred;
  let yearTransferred = req.body.data.yearTransferred;
  fullDateTransferred = await toFullDate(
    monthTransferred,
    dayTransferred,
    yearTransferred
  );
  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let fromOfficeName = await getOfficeName(fromLocation, transferrerOffice);
  let toOfficeName = await getOfficeName(toLocation, receiverOffice);
  let history = `Transferred from ${fromOfficeName} to ${toOfficeName} with Document No. ${docNo}`;
  let transactionTypeId = 4;
  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation1 = 2;
  let activityTypeId1 = 2;
  let auditTrailText1 = `Transfer document has been edited by user ${username}.`;
  let activityLocation2 = 1;
  let activityTypeId2 = 2;
  let auditTrailText2 = `Transfer has been edited by user ${username}.`;
  let activityLocation3 = 2;
  let activityTypeId3 = 1;
  let auditTrailText3 = `Transfer has been added by user ${username}.`;
  //Check Document No.
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM TransferDocument WHERE DocNo = '" + docNo + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length >= 1) {
        if (result.recordset[0].RecordNo === oldRecNo) {
          transferDocumentState = true;
        } else {
          transferDocumentState = false;
        }
      } else {
        transferDocumentState = true;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });
  if (transferDocumentState) {
    //Add Transfer Document
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE TransferDocument SET DocNo = '" +
          docNo +
          "', PropertyTypeId = " +
          propertyType +
          ", TransferringLocation = " +
          fromLocation +
          ", TransferringOffice = " +
          transferrerOffice +
          ", ReceivingLocation = " +
          toLocation +
          ", ReceivingOffice = " +
          receiverOffice +
          ", ReceivingEmployee = " +
          toEmp +
          ", TotalAmount = " +
          totalAmount +
          ",TransferRemarks = '" +
          transferRemarks +
          "', MonthTransferred = '" +
          monthTransferred +
          "', DayTransferred = '" +
          dayTransferred +
          "', YearTransferred = '" +
          yearTransferred +
          "', FullDateTransferred = '" +
          fullDateTransferred +
          "', FullDateAdded = '" +
          fullDateAdded +
          "' WHERE RecordNo = " +
          oldRecNo +
          "";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Transfer Item Updated Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
    //Audit Trail Add (For Document Edit)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
          activityLocation1 +
          ", " +
          oldRecNo +
          ", " +
          activityTypeId1 +
          ", '" +
          auditTrailText1 +
          "', " +
          userId +
          ", '" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Audit Trail (For Document Edit) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    if (propertyType === 2) {
      //Get Selected Items
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "SELECT * FROM TransferItemEquipmentDetailsView WHERE TransferDocumentId = " +
            oldRecNo +
            "";
          return pool.request().query(query);
        })
        .then(async (result) => {
          existingItems = result.recordset;
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });

      for (i = 0; i < existingItems.length; i++) {
        //Edit Equipment
        await new sql.ConnectionPool(DBConfig)
          .connect()
          .then((pool) => {
            // Query
            let query =
              "UPDATE Equipment SET CurrentLocation = " +
              toLocation +
              ", CurrentOffice = " +
              receiverOffice +
              ", CurrentOfficerId = " +
              toEmp +
              " WHERE RecordNo = " +
              existingItems[i].EquipmentId +
              "";
            return pool.request().query(query);
          })
          .then(async (result) => {
            await console.log("Equipment Updated Successfully");
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });

        //Edit History
        await new sql.ConnectionPool(DBConfig)
          .connect()
          .then((pool) => {
            // Query
            let query =
              "UPDATE ItemHistory SET MonthOfTransaction = '" +
              monthTransferred +
              "', DayOfTransaction = '" +
              dayTransferred +
              "', YearOfTransaction = '" +
              yearTransferred +
              "', FullDateOfTransaction = '" +
              fullDateTransferred +
              "', History = '" +
              history +
              "' WHERE PpeId = " +
              existingItems[i].PpeId +
              " AND DocId = " +
              oldRecNo +
              "";
            return pool.request().query(query);
          })
          .then(async (result) => {
            await console.log("Item History Updated Successfully");
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });

        //Audit Trail Add (For Item Transfer Edit)
        await new sql.ConnectionPool(DBConfig)
          .connect()
          .then((pool) => {
            // Query
            let query =
              "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
              activityLocation2 +
              ", " +
              existingItems[i].PpeId +
              ", " +
              activityTypeId2 +
              ", '" +
              auditTrailText2 +
              "', " +
              userId +
              ", '" +
              fullDateAdded +
              "')";
            return pool.request().query(query);
          })
          .then(async (result) => {
            await console.log(
              "Audit Trail (For Item Transfer Edit) Added Successfully"
            );
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });
      }
    } else if (propertyType === 5) {
      //Get Selected Items
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "SELECT * FROM TransferItemVehicleDetailsView WHERE TransferDocumentId = " +
            oldRecNo +
            "";
          return pool.request().query(query);
        })
        .then(async (result) => {
          existingItems = await result.recordset;
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });

      for (i = 0; i < existingItems.length; i++) {
        //Edit Vehicle
        await new sql.ConnectionPool(DBConfig)
          .connect()
          .then((pool) => {
            // Query
            let query =
              "UPDATE Vehicle SET CurrentLocation = " +
              toLocation +
              ", CurrentOffice = " +
              receiverOffice +
              ", CurrentOfficerId = " +
              toEmp +
              " WHERE RecordNo = " +
              existingItems[i].VehicleId +
              "";
            return pool.request().query(query);
          })
          .then(async (result) => {
            await console.log("Vehicle Updated Successfully");
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });

        //Edit History
        await new sql.ConnectionPool(DBConfig)
          .connect()
          .then((pool) => {
            // Query
            let query =
              "UPDATE ItemHistory SET MonthOfTransaction = '" +
              monthTransferred +
              "', DayOfTransaction = '" +
              dayTransferred +
              "', YearOfTransaction = '" +
              yearTransferred +
              "', FullDateOfTransaction = '" +
              fullDateTransferred +
              "', History = '" +
              history +
              "' WHERE PpeId = " +
              existingItems[i].PpeId +
              " AND DocId = " +
              oldRecNo +
              "";
            return pool.request().query(query);
          })
          .then(async (result) => {
            await console.log("Item History Updated Successfully");
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });

        //Audit Trail Add (For Item Transfer Edit)
        await new sql.ConnectionPool(DBConfig)
          .connect()
          .then((pool) => {
            // Query
            let query =
              "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
              activityLocation2 +
              ", " +
              existingItems[i].PpeId +
              ", " +
              activityTypeId2 +
              ", '" +
              auditTrailText2 +
              "', " +
              userId +
              ", '" +
              fullDateAdded +
              "')";
            return pool.request().query(query);
          })
          .then(async (result) => {
            await console.log(
              "Audit Trail (For Item Transfer Edit) Added Successfully"
            );
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });
      }
    }

    if (selectedItems.length !== 0) {
      if (propertyType === 2) {
        for (i = 0; i < selectedItems.length; i++) {
          let transferringEmployeeId;
          let eqRecordNo = selectedItems[i].RecordNo;
          let ppeId = selectedItems[i].PpeId;
          //Get Transferring Employee
          await new sql.ConnectionPool(DBConfig)
            .connect()
            .then((pool) => {
              // Query
              let query =
                "SELECT * FROM Equipment WHERE RecordNo = " + eqRecordNo + "";
              return pool.request().query(query);
            })
            .then(async (result) => {
              transferringEmployeeId = result.recordset[0].CurrentOfficerId;
              await console.log(transferringEmployeeId);
              await console.log("Fetch Transferring Employee Successfully");
            })
            .catch(async (err) => {
              await console.log(err);
              await sql.close();
            });
          // Add TransferItem
          await new sql.ConnectionPool(DBConfig)
            .connect()
            .then((pool) => {
              // Query
              let query =
                "INSERT INTO TransferItem (TransferDocumentId, PpeId, FullDateAdded) VALUES(" +
                oldRecNo +
                ", " +
                ppeId +
                ",'" +
                fullDateAdded +
                "')";
              return pool.request().query(query);
            })
            .then(async (result) => {
              await console.log("Insert to Transfer Item Successfully");
            })
            .catch(async (err) => {
              await console.log(err);
              await sql.close();
            });
          //Change Current Officer
          await new sql.ConnectionPool(DBConfig)
            .connect()
            .then((pool) => {
              // Query
              let query =
                "UPDATE Equipment SET CurrentLocation = " +
                toLocation +
                ", CurrentOffice = " +
                receiverOffice +
                ", CurrentOfficerId = " +
                toEmp +
                " WHERE RecordNo = " +
                eqRecordNo +
                "";
              return pool.request().query(query);
            })
            .then(async (result) => {
              await console.log("Udpate Equipment Successfully");
            })
            .catch(async (err) => {
              await console.log(err);
              await sql.close();
            });
          //Item History (Transferred)
          await new sql.ConnectionPool(DBConfig)
            .connect()
            .then((pool) => {
              // Query
              let query =
                "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, DocId, FullDateAdded) VALUES(" +
                transactionTypeId +
                ", '" +
                monthTransferred +
                "','" +
                dayTransferred +
                "', '" +
                yearTransferred +
                "','" +
                fullDateTransferred +
                "', '" +
                history +
                "'," +
                oldRecNo +
                "," +
                ppeId +
                ",'" +
                fullDateAdded +
                "')";
              return pool.request().query(query);
            })
            .then(async (result) => {
              await console.log("History Added (Transferred) Successfully");
            })
            .catch(async (err) => {
              await console.log(err);
              await sql.close();
            });
          //Audit Trail Add (For Add Transfer)
          await new sql.ConnectionPool(DBConfig)
            .connect()
            .then((pool) => {
              // Query
              let query =
                "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
                activityLocation3 +
                ", " +
                ppeId +
                ", " +
                activityTypeId3 +
                ", '" +
                auditTrailText3 +
                "', " +
                userId +
                ", '" +
                fullDateAdded +
                "')";
              return pool.request().query(query);
            })
            .then(async (result) => {
              await console.log(
                "Audit Trail (For Add Transfer) Added Successfully"
              );
            })
            .catch(async (err) => {
              await console.log(err);
              await sql.close();
            });
        }
      } else if (propertyType === 5) {
        for (i = 0; i < selectedItems.length; i++) {
          let transferringEmployeeId;
          let vehicleRecordNo = selectedItems[i].RecordNo;
          let ppeId = selectedItems[i].PpeId;
          //Get Transferring Employee
          await new sql.ConnectionPool(DBConfig)
            .connect()
            .then((pool) => {
              // Query
              let query =
                "SELECT * FROM Vehicle WHERE RecordNo = " +
                vehicleRecordNo +
                "";
              return pool.request().query(query);
            })
            .then(async (result) => {
              transferringEmployeeId = result.recordset[0].CurrentOfficerId;
              await console.log("Fetch Transferring Employee Successfully");
            })
            .catch(async (err) => {
              await console.log(err);
              await sql.close();
            });
          // Add TransferItem
          await new sql.ConnectionPool(DBConfig)
            .connect()
            .then((pool) => {
              // Query
              let query =
                "INSERT INTO TransferItem (TransferDocumentId, PpeId, FullDateAdded) VALUES(" +
                transferDocumentId +
                ", " +
                ppeId +
                ", '" +
                fullDateAdded +
                "')";
              return pool.request().query(query);
            })
            .then(async (result) => {
              await console.log("Insert to Transfer Item Successfully");
            })
            .catch(async (err) => {
              await console.log(err);
              await sql.close();
            });
          //Change Current Officer
          await new sql.ConnectionPool(DBConfig)
            .connect()
            .then((pool) => {
              // Query
              let query =
                "UPDATE Vehicle SET CurrentLocation = " +
                toLocation +
                ", CurrentOffice = " +
                receiverOffice +
                ", CurrentOfficerId = " +
                toEmp +
                " WHERE RecordNo = " +
                vehicleRecordNo +
                "";
              return pool.request().query(query);
            })
            .then(async (result) => {
              await console.log("Update Current Office Successfully");
            })
            .catch(async (err) => {
              await console.log(err);
              await sql.close();
            });
          //Item History (Transferred)
          await new sql.ConnectionPool(DBConfig)
            .connect()
            .then((pool) => {
              // Query
              let query =
                "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, DodId, FullDateAdded) VALUES(" +
                transactionTypeId +
                ", '" +
                monthTransferred +
                "','" +
                dayTransferred +
                "', '" +
                yearTransferred +
                "','" +
                fullDateTransferred +
                "', '" +
                history +
                "'," +
                ppeId +
                "," +
                oldRecNo +
                ",'" +
                fullDateAdded +
                "')";
              return pool.request().query(query);
            })
            .then(async (result) => {
              await console.log("History Added (Transferred) Successfully");
            })
            .catch(async (err) => {
              await console.log(err);
              await sql.close();
            });
          //Audit Trail Add (For Add Transfer)
          await new sql.ConnectionPool(DBConfig)
            .connect()
            .then((pool) => {
              // Query
              let query =
                "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
                activityLocation3 +
                ", " +
                ppeId +
                ", " +
                activityTypeId3 +
                ", '" +
                auditTrailText3 +
                "', " +
                userId +
                ", '" +
                fullDateAdded +
                "')";
              return pool.request().query(query);
            })
            .then(async (result) => {
              await console.log(
                "Audit Trail (For Add Transfer) Added Successfully"
              );
            })
            .catch(async (err) => {
              await console.log(err);
              await sql.close();
            });
        }
      }
    }
    await res.json(0);
    await sql.close();
  } else {
    await res.json(1);
    await sql.close();
  }
});

//Update Condemn Details (✓)
router.post("/editCondemnDetails", async function (req, res) {
  let ppeId = req.body.data.ppeId;
  let condemnDetailsId = req.body.data.condemnDetailsId;
  let condemnReason = req.body.data.condemnReason;
  let monthCondemned = req.body.data.monthCondemned;
  let dayCondemned = req.body.data.dayCondemned;
  let yearCondemned = req.body.data.yearCondemned;
  fullDateCondemned = await toFullDate(
    monthCondemned,
    dayCondemned,
    yearCondemned
  );

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");

  let userId = req.body.data.userId;
  let username = await getUsername(userId);

  let activityLocation = 1;
  let activityTypeId = 2;
  let auditTrailText = `Condemn Details edited by user ${username}.`;

  //Update Condemn Details
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "UPDATE CondemnDetails SET Reason = '" +
        condemnReason +
        "', MonthCondemned = '" +
        monthCondemned +
        "', DayCondemned = '" +
        dayCondemned +
        "', YearCondemned = '" +
        yearCondemned +
        "', FullDateCondemned = '" +
        fullDateCondemned +
        "' WHERE RecordNo = " +
        condemnDetailsId +
        "";
      return pool.request().query(query);
    })
    .then(async (result) => {
      console.log("Condemn Details Updated!");
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //Audit Trail Edit (For Edit Condemn Detail)
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
        activityLocation +
        ", " +
        ppeId +
        ", " +
        activityTypeId +
        ", '" +
        auditTrailText +
        "', " +
        userId +
        ", '" +
        fullDateAdded +
        "')";
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log(
        "Audit Trail (For Edit Condemn Detail) Edited Successfully"
      );
      await res.json(0);
      await sql.close();
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });
});

module.exports = router;
