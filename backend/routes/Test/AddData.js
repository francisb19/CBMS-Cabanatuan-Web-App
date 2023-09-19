var express = require("express");
var sql = require("mssql/msnodesqlv8");
var moment = require("moment");
const bcrypt = require("bcrypt");
const e = require("express");

const router = express.Router();

const saltRounds = 10;

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

const toTitleCase = (phrase) => {
  return phrase
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

//Add User (✓)
router.post("/addUser", async function (req, res) {
  let userCheck;
  let employeeId = req.body.data.userId;
  let username = req.body.data.username;
  username = username.replace(/'/g, "''");
  let userRoleId = req.body.data.userRole;
  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");

  //User Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM UserList WHERE (EmployeeId = '" +
        employeeId +
        "' AND isActive = 1) OR (Username = '" +
        username +
        "') ";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length === 0) {
        userCheck = await true;
      } else {
        userCheck = await false;
        await console.log("User already has an active account!");
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (userCheck === false) {
    await res.json(1);
    await sql.close();
  } else {
    //Hash Password
    await bcrypt.hash("123456", saltRounds, async function (err, hash) {
      //User Add
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO UserList (Username, Password, EmployeeId, RoleId, FullDateAdded) VALUES('" +
            username +
            "', '" +
            hash +
            "', " +
            employeeId +
            ", " +
            userRoleId +
            ",'" +
            fullDateAdded +
            "')";
          return pool.request().query(query);
        })
        .then(async (result) => {
          await console.log("User Successfully Added!");
          res.json(0);
          await sql.close();
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });
    });
  }
});

//Add Unit (✓)
router.post("/addUnit", async function (req, res) {
  let unitNameCheck;
  let unitName = req.body.data;
  unitName = unitName.replace(/'/g, "''");

  //Unit Name Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Unit WHERE Unit = '" + unitName + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length === 0) {
        unitNameCheck = await true;
      } else {
        unitNameCheck = await false;
        await console.log("Unit Already Existing!");
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (unitNameCheck === false) {
    await res.json(1);
    await sql.close();
  } else {
    //Unit Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query = "INSERT INTO Unit (Unit) VALUES('" + unitName + "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Unit Successfully Added!");
        res.json(0);
        await sql.close();
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  }
});

//Add Office (✓)
router.post("/addOffice", async function (req, res) {
  let officeNameCheck, officeCodeCheck;
  let officeName = req.body.data.officeName;
  officeName = officeName.replace(/'/g, "''");
  let officeCode = req.body.data.officeCode;
  officeCode = officeCode.replace(/'/g, "''");

  //Office Name Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM Office WHERE OfficeName = '" + officeName + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length === 0) {
        officeNameCheck = await true;
      } else {
        officeNameCheck = await false;
        await console.log("Office Name Already Existing!");
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //Office Code Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM Office WHERE OfficeCode = '" + officeCode + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length === 0) {
        officeCodeCheck = await true;
      } else {
        officeCodeCheck = await false;
        await console.log("Office Code Already Existing!");
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (officeNameCheck === false || officeCodeCheck === false) {
    await res.json(1);
    await sql.close();
  } else {
    //Office Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO Office (OfficeName, OfficeCode) VALUES('" +
          officeName +
          "', '" +
          officeCode +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Office Successfully Added!");
        res.json(0);
        await sql.close();
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  }
});

//Add Office Employee (✓)
router.post("/addOfficeEmployee", async function (req, res) {
  let employeeCheck;
  let employeeName = req.body.data.employeeName;
  employeeName = employeeName.replace(/'/g, "''");
  let position = req.body.data.position;
  position = position.replace(/'/g, "''");
  let officeId = req.body.data.officeId;

  //Employee Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM OfficeEmployee WHERE EmployeeName = '" +
        employeeName +
        "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length === 0) {
        employeeCheck = await true;
      } else {
        employeeCheck = await false;
        await console.log("Employee Already Existing On Other Office!");
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (employeeCheck === false) {
    await res.json(1);
    await sql.close();
  } else {
    //Employee Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO OfficeEmployee (EmployeeName, Position, OfficeId) VALUES('" +
          employeeName +
          "', '" +
          position +
          "'," +
          officeId +
          ")";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Employee Successfully Added!");
        res.json(0);
        await sql.close();
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  }
});

//Add Barangay Employee (✓)
router.post("/addBrgyEmployee", async function (req, res) {
  let brgyCheck;
  let employeeName = req.body.data.employeeName;
  employeeName = employeeName.replace(/'/g, "''");
  let position = req.body.data.position;
  position = position.replace(/'/g, "''");
  let brgyId = req.body.data.brgyId;

  //Barangay Employee Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM BarangayOfficer WHERE BarangayOfficerName = '" +
        employeeName +
        "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length === 0) {
        brgyCheck = await true;
      } else {
        brgyCheck = await false;
        await console.log("Employee Already Existing On Barangay!");
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (brgyCheck === false) {
    await res.json(1);
    await sql.close();
  } else {
    //Barangay Employee Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO BarangayOfficer (BarangayOfficerName, Position, BarangayId) VALUES('" +
          employeeName +
          "', '" +
          position +
          "'," +
          brgyId +
          ")";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Barangay Employee Successfully Added!");
        res.json(0);
        await sql.close();
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  }
});

//Add Building (✓)
router.post("/addBuildingItem", async function (req, res) {
  let buildingAdd,
    ppeDetailsId,
    ppeId,
    fullDateAcquired,
    fullDateCompleted,
    fullDateStarted;
  let itemNo = req.body.data.itemNo;
  itemNo = parseInt(itemNo);
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

  let history1 = "Acquired by GSO.";
  let transactionTypeId1 = 1;

  let history2 = "Construction started.";
  let transactionTypeId2 = 6;

  let history3 = "Construction completed.";
  let transactionTypeId3 = 5;

  let userId = req.body.data.userId;
  await console.log(userId);
  let username = await getUsername(userId);
  await console.log(username);

  let activityLocation = 1;
  let activityTypeId = 1;
  let auditTrailText = `Added by user ${username}.`;

  //Item No. Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Building WHERE itemNo = '" + itemNo + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length === 0) {
        buildingAdd = await true;
      } else {
        await console.log("Item No. already Used");
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (buildingAdd) {
    //Building Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO Building (ItemNo, Description, EstimatedLife, AcquisitionCost, Remarks, MonthAcquired, DayAcquired, YearAcquired, FullDateAcquired, MonthStarted, DayStarted, YearStarted, FullDateStarted, MonthCompleted, DayCompleted, YearCompleted, FullDateCompleted, FullDateAdded) VALUES (" +
          itemNo +
          ", '" +
          description +
          "', " +
          estimatedLife +
          ", " +
          acquisitionCost +
          ", '" +
          remarks +
          "', '" +
          monthAcquired +
          "', '" +
          yearAcquired +
          "', '" +
          dayAcquired +
          "','" +
          fullDateAcquired +
          "', '" +
          monthStarted +
          "', '" +
          dayStarted +
          "', '" +
          yearStarted +
          "','" +
          fullDateStarted +
          "', '" +
          monthCompleted +
          "', '" +
          dayCompleted +
          "', '" +
          yearCompleted +
          "','" +
          fullDateCompleted +
          "', '" +
          fullDateAdded +
          "') SELECT SCOPE_IDENTITY() as ppeDetailsId";
        return pool.request().query(query);
      })
      .then(async (result) => {
        ppeDetailsId = await result.recordset[0].ppeDetailsId;
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //PPEList Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO Ppe (PropertyTypeId, PpeDetailsId, FullDateAdded) VALUES(" +
          propertyTypeId +
          "," +
          ppeDetailsId +
          ",'" +
          fullDateAdded +
          "') SELECT SCOPE_IDENTITY() as ppeId";
        return pool.request().query(query);
      })
      .then(async (result) => {
        ppeId = await result.recordset[0].ppeId;
        await console.log("Ppe Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Item History (Acquired)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, FullDateAdded) VALUES(" +
          transactionTypeId1 +
          ", '" +
          monthAcquired +
          "','" +
          dayAcquired +
          "', '" +
          yearAcquired +
          "','" +
          fullDateAcquired +
          "', '" +
          history1 +
          "'," +
          ppeId +
          ",'" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("History Added (Acquired) Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Item History (Project Started)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, FullDateAdded) VALUES(" +
          transactionTypeId2 +
          ", '" +
          monthStarted +
          "','" +
          dayStarted +
          "', '" +
          yearStarted +
          "','" +
          fullDateStarted +
          "', '" +
          history2 +
          "'," +
          ppeId +
          ",'" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("History Added (Project Started) Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Item History (Project Completed)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, FullDateAdded) VALUES(" +
          transactionTypeId3 +
          ", '" +
          monthCompleted +
          "','" +
          dayCompleted +
          "', '" +
          yearCompleted +
          "','" +
          fullDateCompleted +
          "', '" +
          history3 +
          "'," +
          ppeId +
          ",'" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("History Added (Project Completed) Successfully");
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
        await console.log("Audit Trail (For Add) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    await console.log("Add Building Process Successful!");
    await res.json(0);
    await sql.close();
  } else {
    await res.json(1);
    await sql.close();
  }
});

//Add Equipment (✓)
router.post("/addEquipmentItem", async function (req, res) {
  let transferDocumentState,
    addToTransferDocState,
    supplierAdd,
    itemTypeAdd,
    equipmentAdd,
    supplierId,
    itemTypeId,
    ppeDetailsId,
    ppeId,
    documentTypeId,
    transferDocumentId,
    fullDateAcquired,
    fullDateTransferred;
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
  let description = req.body.data.description;
  description = description.replace(/'/g, "''");
  description = toTitleCase(description);
  let serialNo = req.body.data.serialNo;
  serialNo = serialNo.replace(/'/g, "''");
  let shelfLife = req.body.data.shelfLife;
  shelfLife = shelfLife.replace(/'/g, "''");
  let remarks = req.body.data.remarks;
  remarks = remarks.replace(/'/g, "''");
  let transferRemarks = req.body.data.transferRemarks;
  transferRemarks = transferRemarks.replace(/'/g, "''");

  let transferDocumentNo = req.body.data.transferDocumentNo;
  let receivingLocation = req.body.data.receiverLocation;
  let receivingOffice = req.body.data.receiverOffice;
  let receivingEmployee = req.body.data.receiverEmployee;

  let transferringLocation = 2;
  let transferringOffice = 1;
  let transferringEmployee = null;

  let currentLocation = receivingLocation;
  let currentOffice = receivingOffice;
  let currentOfficer = receivingEmployee;

  let monthAcquired = req.body.data.monthAcquired;
  let dayAcquired = req.body.data.dayAcquired;
  let yearAcquired = req.body.data.yearAcquired;
  fullDateAcquired = await toFullDate(monthAcquired, dayAcquired, yearAcquired);

  let monthTransferred = req.body.data.monthTransferred;
  let dayTransferred = req.body.data.dayTransferred;
  let yearTransferred = req.body.data.yearTransferred;
  fullDateTransferred = await toFullDate(
    monthTransferred,
    dayTransferred,
    yearTransferred
  );

  if (totalAcquisition <= 50000) {
    documentTypeId = 2;
  } else if (totalAcquisition > 50000) {
    documentTypeId = 1;
  }

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let propertyTypeId = 2;

  let history1 = "Acquired by GSO.";
  let transactionTypeId1 = 1;

  let fromOfficeName = await getOfficeName(
    transferringLocation,
    transferringOffice
  );
  let toOfficeName = await getOfficeName(receivingLocation, receivingOffice);
  let history2 = `Transferred from ${fromOfficeName} to ${toOfficeName} with Document No. ${transferDocumentNo}`;
  let transactionTypeId2 = 4;

  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation1 = 1;
  let activityTypeId1 = 1;
  let auditTrailText1 = `Added by user ${username}.`;

  let activityLocation2 = 2;
  let activityTypeId2 = 1;
  let auditTrailText2 = `Added by user ${username}.`;

  let activityLocation3 = 1;
  let activityTypeId3 = 1;
  let auditTrailText3 = `Transfer has been added by user ${username}.`;

  //Prop No Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Equipment WHERE PropertyNo = '" + propNo + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length === 0) {
        equipmentAdd = await true;
      } else {
        equipmentAdd = await false;
        await console.log("Property No. already Used");
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //Check Document No.
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM TransferDocument WHERE DocNo = '" +
        transferDocumentNo +
        "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length > 1) {
        transferDocumentState = false;
        await console.log("Doc No already used");
      } else if (result.recordset.length === 1) {
        transferDocumentState = true;
        addToTransferDocState = true;
        transferDocumentId = result.recordset[0].RecordNo;
      } else if (result.recordset.length === 0) {
        transferDocumentState = true;
        addToTransferDocState = false;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (equipmentAdd && transferDocumentState) {
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

    //Equipment Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO Equipment (PropertyNo, OsNo, PoNo, SupplierId, Quantity, UnitId, ItemId, Description, SerialNo, UnitCost, TotalAcquisition, ShelfLife, Remarks, AccountCode, MonthAcquired, DayAcquired, YearAcquired, FullDateAcquired, CurrentLocation, CurrentOffice, CurrentOfficerId, FullDateAdded) VALUES('" +
          propNo +
          "', '" +
          osNo +
          "', '" +
          poNo +
          "', " +
          supplierId +
          ", " +
          qty +
          ", " +
          unitId +
          "," +
          itemTypeId +
          ", '" +
          description +
          "', '" +
          serialNo +
          "', " +
          unitCost +
          ", " +
          totalAcquisition +
          ",'" +
          shelfLife +
          "', '" +
          remarks +
          "', '" +
          accountCode +
          "','" +
          monthAcquired +
          "','" +
          dayAcquired +
          "','" +
          yearAcquired +
          "','" +
          fullDateAcquired +
          "'," +
          currentLocation +
          ", " +
          currentOffice +
          ", " +
          currentOfficer +
          ", '" +
          fullDateAdded +
          "') SELECT SCOPE_IDENTITY() as ppeDetailsId";
        return pool.request().query(query);
      })
      .then(async (result) => {
        ppeDetailsId = await result.recordset[0].ppeDetailsId;
        await console.log("Equipment Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //PPEList Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO Ppe (PropertyTypeId, PpeDetailsId, FullDateAdded) VALUES(" +
          propertyTypeId +
          "," +
          ppeDetailsId +
          ",'" +
          fullDateAdded +
          "') SELECT SCOPE_IDENTITY() as ppeId";
        return pool.request().query(query);
      })
      .then(async (result) => {
        ppeId = await result.recordset[0].ppeId;
        await console.log("Ppe Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    if (addToTransferDocState === false) {
      //Transfer Document Add
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO TransferDocument (DocNo,DocumentTypeId,PropertyTypeId,TransferringLocation,TransferringOffice,TransferringEmployee,ReceivingLocation,ReceivingOffice,ReceivingEmployee,TotalAmount,TransferRemarks,MonthTransferred,DayTransferred,YearTransferred,FullDateTransferred,FullDateAdded) VALUES('" +
            transferDocumentNo +
            "', " +
            documentTypeId +
            ", " +
            propertyTypeId +
            ", " +
            transferringLocation +
            ", " +
            transferringOffice +
            ", " +
            transferringEmployee +
            ", " +
            receivingLocation +
            ", " +
            receivingOffice +
            ", " +
            receivingEmployee +
            ", " +
            totalAcquisition +
            ", '" +
            transferRemarks +
            "', '" +
            monthTransferred +
            "', '" +
            dayTransferred +
            "', '" +
            yearTransferred +
            "', '" +
            fullDateTransferred +
            "', '" +
            fullDateAdded +
            "') SELECT SCOPE_IDENTITY() as transferDocumentId";
          return pool.request().query(query);
        })
        .then(async (result) => {
          await console.log("Transfer Document Added Successfully");
          transferDocumentId = await result.recordset[0].transferDocumentId;
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });
    }

    //Transfer Item Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO TransferItem (TransferDocumentId, PpeId, FullDateAdded) VALUES(" +
          transferDocumentId +
          ", " +
          ppeId +
          ",'" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Transfer Item Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Item History (Acquired)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, FullDateAdded) VALUES(" +
          transactionTypeId1 +
          ", '" +
          monthAcquired +
          "','" +
          dayAcquired +
          "', '" +
          yearAcquired +
          "','" +
          fullDateAcquired +
          "', '" +
          history1 +
          "'," +
          ppeId +
          ",'" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("History Added (Acquired) Successfully");
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
          transactionTypeId2 +
          ", '" +
          monthTransferred +
          "','" +
          dayTransferred +
          "', '" +
          yearTransferred +
          "','" +
          fullDateTransferred +
          "', '" +
          history2 +
          "'," +
          ppeId +
          "," +
          transferDocumentId +
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

    //Audit Trail Add (For Add)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
          activityLocation1 +
          ", " +
          ppeId +
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
        await console.log("Audit Trail (For Add) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Audit Trail Add (For Document Creation)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
          activityLocation2 +
          ", " +
          transferDocumentId +
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
          "Audit Trail (For Document Creation) Added Successfully"
        );
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
        await console.log("Audit Trail (For Add Transfer) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    await console.log("Add Equipment Process Successful!");
    await res.json(0);
    await sql.close();
  } else {
    if (transferDocumentState === false) {
      await res.json(2);
      await sql.close();
    }

    if (equipmentAdd === false) {
      await res.json(1);
      await sql.close();
    }
  }
});

//Add Infrastructure Assets (✓)
router.post("/addInfrastructureAsset", async function (req, res) {
  let infrastructureAdd, ppeDetailsId, ppeId;
  let roadNetworkId = req.body.data.roadNetworkId;
  roadNetworkId = roadNetworkId.replace(/'/g, "''");
  let name = req.body.data.name;
  name = name.replace(/'/g, "''");
  name = toTitleCase(name);
  let component = req.body.data.component;
  component = component.replace(/'/g, "''");
  let reference = req.body.data.reference;
  reference = reference.replace(/'/g, "''");
  let cost = req.body.data.cost;
  cost = parseFloat(cost).toFixed(2);
  let remarks = req.body.data.remarks;
  remarks = remarks.replace(/'/g, "''");

  let monthAcquired = req.body.data.monthAcquired;
  let dayAcquired = req.body.data.dayAcquired;
  let yearAcquired = req.body.data.yearAcquired;
  fullDateAcquired = await toFullDate(monthAcquired, dayAcquired, yearAcquired);

  let currentLocation = 2;
  let currentOffice = 1;
  let currentOfficer = null;

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let propertyTypeId = 3;

  let history = "Acquired by GSO.";
  let transactionTypeId = 1;

  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation = 1;
  let activityTypeId = 1;
  let auditTrailText = `Added by user ${username}.`;

  //Road Network ID Check
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
      if (result.recordset.length === 0) {
        infrastructureAdd = await true;
      } else {
        await console.log("Road Network Id already Used");
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (infrastructureAdd) {
    //Add Infrastructure
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO InfrastructureAsset (RoadNetworkId, Name, Component, MonthAcquired, DayAcquired, YearAcquired, FullDateAcquired, Reference, Cost, Remarks, FullDateAdded) VALUES ('" +
          roadNetworkId +
          "', '" +
          name +
          "', '" +
          component +
          "', '" +
          monthAcquired +
          "', '" +
          dayAcquired +
          "', '" +
          yearAcquired +
          "','" +
          fullDateAcquired +
          "', '" +
          reference +
          "', " +
          cost +
          ", '" +
          remarks +
          "', '" +
          fullDateAdded +
          "') SELECT SCOPE_IDENTITY() as ppeDetailsId";
        return pool.request().query(query);
      })
      .then(async (result) => {
        ppeDetailsId = await result.recordset[0].ppeDetailsId;
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //PPEList Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO Ppe (PropertyTypeId, PpeDetailsId, FullDateAdded) VALUES(" +
          propertyTypeId +
          "," +
          ppeDetailsId +
          ",'" +
          fullDateAdded +
          "') SELECT SCOPE_IDENTITY() as ppeId";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Ppe Added Successfully");
        ppeId = await result.recordset[0].ppeId;
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Item History (Acquired)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, FullDateAdded) VALUES(" +
          transactionTypeId +
          ", '" +
          monthAcquired +
          "','" +
          dayAcquired +
          "', '" +
          yearAcquired +
          "','" +
          fullDateAcquired +
          "', '" +
          history +
          "'," +
          ppeId +
          ",'" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("History Added (Acquired) Successfully");
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
        await console.log("Audit Trail (For Add) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    await console.log("Add Infrastructure Assets Process Successful!");
    await res.json(0);
    await sql.close();
  } else {
    await res.json(1);
    await sql.close();
  }
});

//Add Land (✓)
router.post("/addLand", async function (req, res) {
  let landAdd,
    ppeDetailsId,
    ppeId,
    statusOfDocumentAdd,
    statusOfDocumentId,
    titleOwnerAdd,
    titleOwnerId;
  let tctNo = req.body.data.tctNo;
  tctNo = tctNo.replace(/'/g, "''");
  let locationId = req.body.data.location;
  let landType = req.body.data.landType;
  let utilizedAs = req.body.data.utilizedAs;
  utilizedAs = utilizedAs.replace(/'/g, "''");
  utilizedAs = toTitleCase(utilizedAs);
  let titleOwner = req.body.data.titleOwner;
  titleOwner = titleOwner.replace(/'/g, "''");
  titleOwner = toTitleCase(titleOwner);
  let statusOfDocument = req.body.data.statusOfDocument;
  statusOfDocument = statusOfDocument.replace(/'/g, "''");
  statusOfDocument = toTitleCase(statusOfDocument);
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

  let currentLocation = 2;
  let currentOffice = 1;
  let currentOfficer = null;

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let propertyTypeId = 4;

  let history = "Acquired by GSO.";
  let transactionTypeId = 1;

  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation = 1;
  let activityTypeId = 1;
  let auditTrailText = `Added by user ${username}.`;

  //Road Network ID Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM Land WHERE TctNo = '" + tctNo + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length === 0) {
        landAdd = await true;
      } else {
        await console.log("TCT No. already Used");
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (landAdd) {
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

    //Add Land
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO Land (TctNo, LandTypeId, LocationId, Area, UtilizedAs, TitleOwnerId, StatusOfDocumentId, Fund, Remarks, MonthAcquired, DayAcquired, YearAcquired, FullDateAcquired, FullDateAdded) VALUES ('" +
          tctNo +
          "', " +
          landType +
          ", " +
          locationId +
          ", '" +
          area +
          "', '" +
          utilizedAs +
          "', '" +
          titleOwnerId +
          "', '" +
          statusOfDocumentId +
          "', '" +
          fund +
          "', '" +
          remarks +
          "', '" +
          monthAcquired +
          "', '" +
          dayAcquired +
          "', '" +
          yearAcquired +
          "', '" +
          fullDateAcquired +
          "', '" +
          fullDateAdded +
          "') SELECT SCOPE_IDENTITY() as ppeDetailsId";
        return pool.request().query(query);
      })
      .then(async (result) => {
        ppeDetailsId = await result.recordset[0].ppeDetailsId;
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //PPEList Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO Ppe (PropertyTypeId, PpeDetailsId, FullDateAdded) VALUES(" +
          propertyTypeId +
          "," +
          ppeDetailsId +
          ",'" +
          fullDateAdded +
          "') SELECT SCOPE_IDENTITY() as ppeId";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Ppe Added Successfully");
        ppeId = await result.recordset[0].ppeId;
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Item History (Acquired)
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, FullDateAdded) VALUES(" +
          transactionTypeId +
          ", '" +
          monthAcquired +
          "','" +
          dayAcquired +
          "', '" +
          yearAcquired +
          "','" +
          fullDateAcquired +
          "', '" +
          history +
          "'," +
          ppeId +
          ",'" +
          fullDateAdded +
          "')";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("History Added (Acquired) Successfully");
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
        await console.log("Audit Trail (For Add) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    await console.log("Add Land Process Successful!");
    await res.json(0);
    await sql.close();
  } else {
    await res.json(1);
    await sql.close();
  }
});

//Add Vehicle (✓)
router.post("/addVehicle", async function (req, res) {
  await console.log(req.body.data);
  let transferDocumentState,
    addToTransferDocState,
    vehicleModelAdd,
    vehicleModelId,
    heavyEquipAdd,
    heavyEquipId,
    colorAdd,
    colorId,
    statusOfDocumentAdd,
    statusOfDocumentId,
    ppeDetailsId,
    ppeId,
    equipCodeCheck,
    plateNoCheck,
    vehicleNoCheck;
  let remarks = req.body.data.remarks;
  let vehicleTypeId = req.body.data.vehicleTypeId;
  let quantity = req.body.data.quantity;
  quantity = parseInt(quantity);
  let vehicleModel = req.body.data.vehicleModel;
  vehicleModel = vehicleModel.replace(/'/g, "''");
  let heavyEquipmentType = req.body.data.heavyEquipmentType;
  heavyEquipmentType = heavyEquipmentType.replace(/'/g, "''");
  heavyEquipmentType = toTitleCase(heavyEquipmentType);
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
  color = color.replace(/'/g, "''");
  color = toTitleCase(color);
  let statusOfDocument = req.body.data.statusOfDocument;
  statusOfDocument = statusOfDocument.replace(/'/g, "''");
  statusOfDocument = toTitleCase(statusOfDocument);
  let policyNo = req.body.data.policyNo;
  policyNo = policyNo.replace(/'/g, "''");
  let insuranceValidityUntil = req.body.data.insuranceValidityUntil;
  let dateOfLastLtoReceipt = req.body.data.dateOfLastLtoReceipt;
  let cost = req.body.data.cost;
  if (cost !== "") {
    cost = parseFloat(cost).toFixed(2);
  }
  let presentConditionId = req.body.data.presentConditionId;
  let conditionAsOf = req.body.data.conditionAsOf;

  let monthAcquired = req.body.data.monthAcquired;
  let dayAcquired = req.body.data.dayAcquired;
  let yearAcquired = req.body.data.yearAcquired;
  fullDateAcquired = await toFullDate(monthAcquired, dayAcquired, yearAcquired);

  let transferDocumentNo = req.body.data.transferDocumentNo;
  let receivingLocation = req.body.data.receiverLocation;
  let receivingOffice = req.body.data.receiverOffice;
  let receivingEmployee = req.body.data.receiverEmployee;

  let transferRemarks = req.body.data.transferRemarks;
  transferRemarks = transferRemarks.replace(/'/g, "''");

  let transferringLocation = 2;
  let transferringOffice = 1;
  let transferringEmployee = null;

  let currentLocation = receivingLocation;
  let currentOffice = receivingOffice;
  let currentOfficer = receivingEmployee;

  let monthTransferred = req.body.data.monthTransferred;
  let dayTransferred = req.body.data.dayTransferred;
  let yearTransferred = req.body.data.yearTransferred;
  fullDateTransferred = await toFullDate(
    monthTransferred,
    dayTransferred,
    yearTransferred
  );

  if (cost <= 50000) {
    documentTypeId = 2;
  } else if (cost > 50000) {
    documentTypeId = 1;
  } else if (cost === "") {
    documentTypeId = 2;
  }

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let propertyTypeId = 5;

  let history1 = "Acquired by GSO.";
  let transactionTypeId1 = 1;

  let fromOfficeName = await getOfficeName(
    transferringLocation,
    transferringOffice
  );
  let toOfficeName = await getOfficeName(receivingLocation, receivingOffice);
  let history2 = `Transferred from ${fromOfficeName} to ${toOfficeName} with Document No. ${transferDocumentNo}`;
  let transactionTypeId2 = 4;

  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation1 = 1;
  let activityTypeId1 = 1;
  let auditTrailText1 = `Added by user ${username}.`;

  let activityLocation2 = 2;
  let activityTypeId2 = 1;
  let auditTrailText2 = `Added by user ${username}.`;

  let activityLocation3 = 1;
  let activityTypeId3 = 1;
  let auditTrailText3 = `Transfer has been added by user ${username}.`;

  //Check Document No.
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM TransferDocument WHERE DocNo = '" +
        transferDocumentNo +
        "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length > 1) {
        transferDocumentState = false;
        await console.log("Doc No already used");
      } else if (result.recordset.length === 1) {
        transferDocumentState = true;
        addToTransferDocState = true;
        transferDocumentId = result.recordset[0].RecordNo;
      } else if (result.recordset.length === 0) {
        transferDocumentState = true;
        addToTransferDocState = false;
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (transferDocumentState) {
    if (equipmentCode !== "") {
      //Equipment Code Check
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "SELECT * FROM Vehicle WHERE EquipmentCode = '" +
            equipmentCode +
            "'";
          return pool.request().query(query);
        })
        .then(async (result) => {
          if (result.recordset.length === 0) {
            equipCodeCheck = await true;
          } else {
            equipCodeCheck = await false;
            await console.log("Equipment Code Already Used");
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
            vehicleNoCheck = await false;
            await console.log("Vehicle No. Already Used");
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
            plateNoCheck = await false;
            await console.log("Plate No. Already Used");
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

      //Vehicle Add
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO Vehicle (VehicleTypeId, HeavyEquipmentTypeId, VehicleModelId, Quantity, EquipmentCode, VehicleNo, PropertyNo, ConductionStickerNo, PlateNo, MvFileNo, CrNo, EngineNo, ChassisNo, ColorId, StatusOfDocumentId, PolicyNo, InsuranceValidityUntil, DateOfLastLtoReceipt, MonthAcquired, DayAcquired, YearAcquired, FullDateAcquired, Cost, PresentConditionId, ConditionAsOf, CurrentLocation, CurrentOffice, CurrentOfficerId, Remarks, FullDateAdded) VALUES(" +
            vehicleTypeId +
            "," +
            heavyEquipId +
            "," +
            vehicleModelId +
            "," +
            quantity +
            ", '" +
            equipmentCode +
            "', '" +
            vehicleNo +
            "', '" +
            propertyNo +
            "', '" +
            condStickerNo +
            "', '" +
            plateNo +
            "', '" +
            mvFileNo +
            "', '" +
            crNo +
            "', '" +
            engineNo +
            "', '" +
            chassisNo +
            "', " +
            colorId +
            ", " +
            statusOfDocumentId +
            ", '" +
            policyNo +
            "', '" +
            insuranceValidityUntil +
            "', '" +
            dateOfLastLtoReceipt +
            "','" +
            monthAcquired +
            "', '" +
            dayAcquired +
            "', '" +
            yearAcquired +
            "','" +
            fullDateAcquired +
            "', '" +
            cost +
            "', " +
            presentConditionId +
            ", '" +
            conditionAsOf +
            "'," +
            currentLocation +
            "," +
            currentOffice +
            "," +
            currentOfficer +
            ",'" +
            remarks +
            "','" +
            fullDateAdded +
            "') SELECT SCOPE_IDENTITY() as ppeDetailsId";
          console.log(query);
          return pool.request().query(query);
        })
        .then(async (result) => {
          ppeDetailsId = await result.recordset[0].ppeDetailsId;
          await console.log("Vehicle Added Successfully");
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });

      //PPEList Add
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO Ppe (PropertyTypeId, PpeDetailsId, FullDateAdded) VALUES(" +
            propertyTypeId +
            "," +
            ppeDetailsId +
            ",'" +
            fullDateAdded +
            "') SELECT SCOPE_IDENTITY() as ppeId";
          return pool.request().query(query);
        })
        .then(async (result) => {
          ppeId = await result.recordset[0].ppeId;
          await console.log("Ppe Added Successfully");
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });

      if (addToTransferDocState === false) {
        //Transfer Document Add
        await new sql.ConnectionPool(DBConfig)
          .connect()
          .then((pool) => {
            // Query
            let query =
              "INSERT INTO TransferDocument (DocNo,DocumentTypeId,PropertyTypeId,TransferringLocation,TransferringOffice,TransferringEmployee,ReceivingLocation,ReceivingOffice,ReceivingEmployee,TotalAmount,TransferRemarks,MonthTransferred,DayTransferred,YearTransferred,FullDateTransferred,FullDateAdded) VALUES('" +
              transferDocumentNo +
              "', " +
              documentTypeId +
              ", " +
              propertyTypeId +
              ", " +
              transferringLocation +
              ", " +
              transferringOffice +
              ", " +
              transferringEmployee +
              ", " +
              receivingLocation +
              ", " +
              receivingOffice +
              ", " +
              receivingEmployee +
              ", " +
              cost +
              ", '" +
              transferRemarks +
              "', '" +
              monthTransferred +
              "', '" +
              dayTransferred +
              "', '" +
              yearTransferred +
              "', '" +
              fullDateTransferred +
              "', '" +
              fullDateAdded +
              "') SELECT SCOPE_IDENTITY() as transferDocumentId";
            return pool.request().query(query);
          })
          .then(async (result) => {
            await console.log("Transfer Document Added Successfully");
            transferDocumentId = await result.recordset[0].transferDocumentId;
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });
      }

      //Transfer Item Add
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO TransferItem (TransferDocumentId, PpeId, FullDateAdded) VALUES(" +
            transferDocumentId +
            ", " +
            ppeId +
            ",'" +
            fullDateAdded +
            "')";
          return pool.request().query(query);
        })
        .then(async (result) => {
          await console.log("Transfer Item Added Successfully");
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });

      //Item History (Acquired)
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, FullDateAdded) VALUES(" +
            transactionTypeId1 +
            ", '" +
            monthAcquired +
            "','" +
            dayAcquired +
            "', '" +
            yearAcquired +
            "','" +
            fullDateAcquired +
            "', '" +
            history1 +
            "'," +
            ppeId +
            ",'" +
            fullDateAdded +
            "')";
          return pool.request().query(query);
        })
        .then(async (result) => {
          await console.log("History Added (Acquired) Successfully");
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
            transactionTypeId2 +
            ", '" +
            monthTransferred +
            "','" +
            dayTransferred +
            "', '" +
            yearTransferred +
            "','" +
            fullDateTransferred +
            "', '" +
            history2 +
            "'," +
            ppeId +
            "," +
            transferDocumentId +
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

      //Audit Trail Add (For Add)
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
            activityLocation1 +
            ", " +
            ppeId +
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
          await console.log("Audit Trail (For Add) Added Successfully");
        })
        .catch(async (err) => {
          await console.log(err);
          await sql.close();
        });

      //Audit Trail Add (For Document Creation)
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
            activityLocation2 +
            ", " +
            transferDocumentId +
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
            "Audit Trail (For Document Creation) Added Successfully"
          );
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

      await console.log("Add Vehicle Process Successful!");
      await res.json(0);
      await sql.close();
    }
  } else {
    await res.json(8);
    await sql.close;
  }
});

//Add Ppe Details (✓)
router.post("/addPpeDetails", async function (req, res) {
  let ppeId, detailNameCheck, detailNameId;
  let propType = req.body.data.propType;
  let recordNo = req.body.data.itemRecNo;
  let detailName = req.body.data.detailName;
  detailName = detailName.replace(/'/g, "''");
  let detail = req.body.data.detail;
  detail = detail.replace(/'/g, "''");

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let userId = req.body.data.userId;
  let username = await getUsername(userId);
  let activityLocation = 1;
  let activityTypeId = 1;
  let auditTrailText = `Additional detail has been added by user ${username}.`;

  //Get Ppe Id
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM Ppe WHERE PropertyTypeId = " +
        propType +
        " AND PpeDetailsId = " +
        recordNo +
        "";
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

  //Detail Name Check
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM DetailName WHERE DetailName = '" + detailName + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length === 0) {
        detailNameCheck = await true;
      } else {
        detailNameId = await result.recordset[0].RecordNo;
        await console.log("Detail Name Fetched Successfully");
      }
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  if (detailNameCheck) {
    //Supplier Add
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "INSERT INTO DetailName (DetailName) VALUES('" +
          detailName +
          "') SELECT SCOPE_IDENTITY() as detailNameId";
        return pool.request().query(query);
      })
      .then(async (result) => {
        detailNameId = await result.recordset[0].detailNameId;
        await console.log("Detail Name Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  }

  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "INSERT INTO AdditionalDetail (DetailNameId, AdditionalDetail, PpeId, FullDateAdded) VALUES ('" +
        detailNameId +
        "', '" +
        detail +
        "', " +
        ppeId +
        ", '" +
        fullDateAdded +
        "')";
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log("Additional Detail Added Succesfully!");
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
      await console.log("Audit Trail (For Add) Added Successfully");
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  await console.log("Add Detail Process Successful!");
  await res.json(0);
  await sql.close();
});

module.exports = router;
