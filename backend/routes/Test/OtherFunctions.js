var express = require("express");
var sql = require("mssql/msnodesqlv8");
var moment = require("moment");
const bcrypt = require("bcrypt");

const saltRounds = 10;

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

const getPpeDetailsId = async (propType, ppeId) => {
  let ppeDetailsId;
  if (propType === 2) {
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT Equipment.RecordNo AS EquipmentId FROM Equipment INNER JOIN Ppe ON Equipment.RecordNo = Ppe.PpeDetailsId WHERE Ppe.PropertyTypeId = 2 AND Ppe.RecordNo = " +
          ppeId +
          "";
        return pool.request().query(query);
      })
      .then(async (result) => {
        ppeDetailsId = await result.recordset[0].EquipmentId;
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  } else if (propType === 5) {
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT Vehicle.RecordNo AS VehicleId FROM Vehicle INNER JOIN Ppe ON Vehicle.RecordNo = Ppe.PpeDetailsId WHERE Ppe.PropertyTypeId = 5 AND Ppe.RecordNo = " +
          ppeId +
          "";
        return pool.request().query(query);
      })
      .then(async (result) => {
        ppeDetailsId = await result.recordset[0].VehicleId;
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });
  }
  return await ppeDetailsId;
};

//Login (✓)
router.post("/login", async function (req, res) {
  let username = req.body.data.username;
  let password = req.body.data.password;

  //Login
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM UserList WHERE Username = '" + username + "'";
      return pool.request().query(query);
    })
    .then(async (result) => {
      if (result.recordset.length === 1) {
        //Check Password
        let passwordHashed = result.recordset[0].Password;
        bcrypt.compare(
          password,
          passwordHashed,
          async function (err, compareResult) {
            if (compareResult) {
              //Check Status
              if (result.recordset[0].isActive === true) {
                if (result.recordset[0].FirstTimeLogin === true) {
                  await console.log("User needs to change password!");
                  await res.json(3);
                  await sql.close();
                } else {
                  //Get User Data
                  await new sql.ConnectionPool(DBConfig)
                    .connect()
                    .then((pool) => {
                      // Query
                      let query =
                        "SELECT * FROM UserDataView WHERE Username = '" +
                        username +
                        "'";
                      return pool.request().query(query);
                    })
                    .then(async (result) => {
                      await console.log("Login Successfully!");
                      await res.json(result.recordset[0]);
                      await sql.close();
                    })
                    .catch(async (err) => {
                      await console.log(err);
                      await sql.close();
                    });
                }
              } else {
                await console.log("User is inactive!");
                await res.json(2);
                await sql.close();
              }
            } else {
              await console.log("Password is wrong!");
              await res.json(1);
              await sql.close();
            }
          }
        );
      } else {
        await console.log("Username not found!");
        await res.json(1);
        await sql.close();
      }
    })
    .catch(async (err) => {
      console.log(err);
      sql.close();
    });
});

//Set Password (✓)
router.post("/setPassword", async function (req, res) {
  let username = req.body.data.username;
  let password = req.body.password;

  //Hash Password
  await bcrypt.hash(password, saltRounds, async function (err, hash) {
    //Update Password
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE UserList SET Password = '" +
          hash +
          "', FirstTimeLogin = 0 WHERE Username = '" +
          username +
          "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await console.log("Set Password Successfully!");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    //Get User Data
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "SELECT * FROM UserDataView WHERE Username = '" + username + "'";
        return pool.request().query(query);
      })
      .then(async (result) => {
        await res.json(result.recordset[0]);
        await sql.close();
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });
  });
});

//Condemn Item (✓)
router.post("/condemnItem", async function (req, res) {
  let condemnDetailsId;
  let ppeId = req.body.data.ppeId;
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
  let history = `Condemned by GSO (Reason: ${condemnReason}).`;
  let transactionTypeId = 7;
  let transferDocumentId = null;

  let userId = req.body.data.userId;
  let username = await getUsername(userId);

  let activityLocation = 1;
  let activityTypeId = 2;
  let auditTrailText = `Item condemned by user ${username}.`;

  //Get Udpate Ppe Table
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "INSERT INTO CondemnDetail (Reason, MonthCondemned, DayCondemned, YearCondemned, FullDateCondemned, FullDateAdded) VALUES ('" +
        condemnReason +
        "', '" +
        monthCondemned +
        "', '" +
        dayCondemned +
        "', '" +
        yearCondemned +
        "', '" +
        fullDateCondemned +
        "', '" +
        fullDateAdded +
        "')  SELECT SCOPE_IDENTITY() as condemnDetailsId";
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log("Condemn Details Added!");
      condemnDetailsId = await result.recordset[0].condemnDetailsId;
    })
    .catch(async (err) => {
      console.log(err);
      sql.close();
    });

  //Get Udpate Ppe Table
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "UPDATE Ppe SET isCondemned = 'True',  CondemnDetailId = " +
        condemnDetailsId +
        " WHERE RecordNo = " +
        ppeId +
        "";
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log("Item Successfully Condemned");
    })
    .catch(async (err) => {
      console.log(err);
      sql.close();
    });

  //Item History (Condemned)
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, DocId, FullDateAdded) VALUES(" +
        transactionTypeId +
        ", '" +
        monthCondemned +
        "','" +
        dayCondemned +
        "', '" +
        yearCondemned +
        "','" +
        fullDateCondemned +
        "', '" +
        history +
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
      await console.log("History Added (Condemned) Successfully");
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //Audit Trail Edit (For Edit Condemn Status)
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
        "Audit Trail (For Edit Condemn Status) Edited Successfully"
      );
      await res.json(0);
      await sql.close();
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });
});

//Return Item (✓)
router.post("/returnItem", async function (req, res) {
  let ppeDetailsId;
  let ppeId = req.body.data.ppeId;
  let propTypeId = req.body.data.propTypeId;
  let returnReason = req.body.data.returnReason;
  let monthReturned = req.body.data.monthReturned;
  let dayReturned = req.body.data.dayReturned;
  let yearReturned = req.body.data.yearReturned;
  fullDateReturned = await toFullDate(monthReturned, dayReturned, yearReturned);

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let history = `Returned to GSO (Reason: ${returnReason}).`;
  let transactionTypeId = 5;
  let transferDocumentId = null;

  let newLocation = 2;
  let newOffice = 1;
  let newEmployee = null;

  let userId = req.body.data.userId;
  let username = await getUsername(userId);

  let activityLocation = 1;
  let activityTypeId = 2;
  let auditTrailText = `Item returned to GSO by user ${username}.`;

  //Insert to Return DetailsTable
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "INSERT INTO ReturnItemDetail (PpeId, ReturnReason, MonthReturned, DayReturned, YearReturned, FullDateReturned, FullDateAdded) VALUES (" +
        ppeId +
        ",'" +
        returnReason +
        "', '" +
        monthReturned +
        "', '" +
        dayReturned +
        "', '" +
        yearReturned +
        "', '" +
        fullDateReturned +
        "', '" +
        fullDateAdded +
        "')";
      return pool.request().query(query);
    })
    .then(async (result) => {
      await console.log("Return Details Added!");
    })
    .catch(async (err) => {
      console.log(err);
      sql.close();
    });

  ppeDetailsId = await getPpeDetailsId(propTypeId, ppeId);

  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "Update Equipment SET CurrentLocation = " +
        newLocation +
        ", CurrentOffice = " +
        newOffice +
        ", CurrentOfficerId = " +
        newEmployee +
        " WHERE RecordNo = " +
        ppeDetailsId +
        "";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Update Current Location to last available location");
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });

  //Item History (Returned)
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, DocId, FullDateAdded) VALUES(" +
        transactionTypeId +
        ", '" +
        monthReturned +
        "','" +
        dayReturned +
        "', '" +
        yearReturned +
        "','" +
        fullDateReturned +
        "', '" +
        history +
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
      await console.log("History Added (Returned) Successfully");
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  //Audit Trail Edit (For Edit Current Location)
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
        "Audit Trail (For Edit Current Location) Added Successfully"
      );
      await res.json(0);
      await sql.close();
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });
});

//Transfer Item (✓)
router.post("/transferItems", async function (req, res) {
  let transferDocumentId, transferDocumentState;
  let propertyType = req.body.data.propertyType;
  let selectedItems = req.body.data.selectedItems;
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
  let activityTypeId1 = 1;
  let auditTrailText1 = `Added by user ${username}.`;

  let activityLocation2 = 1;
  let activityTypeId2 = 1;
  let auditTrailText2 = `Transfer has been added by user ${username}.`;

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
        transferDocumentState = false;
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
          "INSERT INTO TransferDocument (DocNo, PropertyTypeId, TransferringLocation, TransferringOffice, ReceivingLocation, ReceivingOffice, ReceivingEmployee, TotalAmount,TransferRemarks, MonthTransferred, DayTransferred, YearTransferred, FullDateTransferred, FullDateAdded) VALUES('" +
          docNo +
          "'," +
          propertyType +
          "," +
          fromLocation +
          ", '" +
          transferrerOffice +
          "'," +
          toLocation +
          ", '" +
          receiverOffice +
          "', " +
          toEmp +
          "," +
          totalAmount +
          ",'" +
          transferRemarks +
          "', '" +
          monthTransferred +
          "','" +
          dayTransferred +
          "', '" +
          yearTransferred +
          "','" +
          fullDateTransferred +
          "', '" +
          fullDateAdded +
          "') SELECT SCOPE_IDENTITY() as transferDocumentId";
        return pool.request().query(query);
      })
      .then(async (result) => {
        transferDocumentId = await result.recordset[0].transferDocumentId;
        await console.log("Transfer Item Added Successfully");
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
          activityLocation1 +
          ", " +
          transferDocumentId +
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
        await console.log(
          "Audit Trail (For Document Creation) Added Successfully"
        );
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

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
            await console.log("Update Equipment Successfully");
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

        //Audit Trail Add (For Add Transfer)
        await new sql.ConnectionPool(DBConfig)
          .connect()
          .then((pool) => {
            // Query
            let query =
              "INSERT INTO AuditTrail(ActivityLocationId, ChangedItemId, ActivityTypeId, Text, UserId, DateOfActivity) VALUES(" +
              activityLocation2 +
              ", " +
              ppeId +
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
              "Audit Trail (For Add Transfer) Added Successfully"
            );
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });
      }
      await res.json(0);
      await sql.close();
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
              "SELECT * FROM Vehicle WHERE RecordNo = " + vehicleRecordNo + "";
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
              "INSERT INTO ItemHistory(TransactionTypeId, MonthOfTransaction, DayOfTransaction, YearOfTransaction, FullDateOfTransaction, History, PpeId, FullDateAdded) VALUES(" +
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
              activityLocation2 +
              ", " +
              ppeId +
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
              "Audit Trail (For Add Transfer) Added Successfully"
            );
          })
          .catch(async (err) => {
            await console.log(err);
            await sql.close();
          });
      }
      await res.json(0);
      await sql.close();
    }
  } else {
    await res.json(1);
    await sql.close();
  }
});

module.exports = router;
