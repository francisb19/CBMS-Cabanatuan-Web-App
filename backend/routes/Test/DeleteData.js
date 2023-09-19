var express = require("express");
var sql = require("mssql/msnodesqlv8");
var moment = require("moment");
const e = require("express");

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

//Delete Additional Detail (✓)
router.post("/deleteAdditionalDetails", async function (req, res) {
  let ppeId;
  let recNo = req.body.data;

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let userId = req.body.userId;
  let username = await getUsername(userId);
  let activityLocation = 1;
  let activityTypeId = 3;
  let auditTrailText = `Additional detail was deleted by user ${username}.`;

  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM AdditionalDetail WHERE RecordNo = " + recNo + "";
      return pool.request().query(query);
    })
    .then(async (result) => {
      ppeId = await result.recordset[0].PpeId;
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });

  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "UPDATE AdditionalDetail SET isDeleted = 1 WHERE RecordNo = " +
        recNo +
        "";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Additional Detail Deleted Successfully!");
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });

  //Audit Trail Add (For Delete Detail)
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
      await console.log("Audit Trail (For Delete Detail) Added Successfully");
    })
    .catch(async (err) => {
      await console.log(err);
      await sql.close();
    });

  res.json(0);
  sql.close();
});

//Delete Item From Document (✓)
router.post("/deleteItemFromDocument", async function (req, res) {
  let ppeId,
    noOfItems,
    tempTotalCost = 0,
    deleteState,
    latestDocNo,
    lastLocation,
    lastOffice,
    lastEmployee;
  let recNo = req.body.data.recNo;
  let propType = req.body.data.propType;
  let docNo = req.body.data.docNo;

  let fullDateAdded = moment().format("YYYY-MM-DD HH:mm:ss");
  let userId = req.body.userId;
  let username = await getUsername(userId);
  let activityLocation = 2;
  let activityTypeId = 3;
  let auditTrailText = `Item was deleted from Transfer Document by user ${username}.`;

  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM Ppe WHERE PpeDetailsId = " +
        recNo +
        " AND PropertyTypeId = " +
        propType +
        "";
      return pool.request().query(query);
    })
    .then(async (result) => {
      ppeId = await result.recordset[0].RecordNo;
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });

  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM TransferItemView ORDER BY YearTransferred DESC, MonthTransferred DESC, DayTransferred DESC, TransferItemId ASC";
      return pool.request().query(query);
    })
    .then(async (result) => {
      latestDocNo = result.recordset[0].TransferDocumentId;
      lastLocation = result.recordset[0].TransferringLocation;
      lastOffice = result.recordset[0].TransferringOffice;
      lastEmployee = result.recordset[0].TransferringEmployee;
      if (latestDocNo === docNo) {
        if (result.recordset[0].isCondemned === true) {
          deleteState = false;
          res.json(2);
          sql.close();
        } else {
          deleteState = true;
        }
      } else {
        deleteState = false;
        res.json(1);
        sql.close();
      }
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
  if (deleteState) {
    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE TransferItem SET isDeleted = 1 WHERE PpeId = " +
          ppeId +
          " AND TransferDocumentId = " +
          docNo +
          "";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log("Item Deleted Successfully!");
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });

    if (propType === 2) {
      let equipmentId;
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "SELECT Equipment.RecordNo FROM Equipment INNER JOIN Ppe ON Equipment.RecordNo = Ppe.PpeDetailsId WHERE Ppe.PropertyTypeId = 2 AND Ppe.RecordNo = " +
            ppeId +
            "";
          return pool.request().query(query);
        })
        .then((result) => {
          equipmentId = result.recordset[0].RecordNo;
        })
        .catch((err) => {
          console.log(err);
          sql.close();
        });

      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "SELECT Equipment.TotalAcquisition, TransferItem.TransferDocumentId FROM Equipment INNER JOIN Ppe ON Equipment.RecordNo = Ppe.PpeDetailsId RIGHT OUTER JOIN TransferItem ON Ppe.RecordNo = TransferItem.PpeId WHERE (TransferItem.TransferDocumentId = " +
            docNo +
            ") AND (TransferItem.isDeleted = 0)";
          return pool.request().query(query);
        })
        .then((result) => {
          noOfItems = result.recordset.length;
          for (let i = 0; i < noOfItems; i++) {
            tempTotalCost =
              tempTotalCost + result.recordset[i].TotalAcquisition;
          }
        })
        .catch((err) => {
          console.log(err);
          sql.close();
        });

      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "Update Equipment SET CurrentLocation = " +
            lastLocation +
            ", CurrentOffice = " +
            lastOffice +
            ", CurrentOfficerId = " +
            lastEmployee +
            " WHERE RecordNo = " +
            equipmentId +
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
    } else if (propType === 5) {
      let transportationId;
      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "SELECT Transportation.RecordNo FROM Transportation INNER JOIN Ppe ON Transportation.RecordNo = Ppe.PpeDetailsId WHERE Ppe.PropertyTypeId = 5 AND Ppe.RecordNo = " +
            ppeId +
            "";
          return pool.request().query(query);
        })
        .then((result) => {
          transportationId = result.recordset[0].RecordNo;
        })
        .catch((err) => {
          console.log(err);
          sql.close();
        });

      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "SELECT Transportation.Cost, TransferItem.TransferDocumentId FROM Transportation INNER JOIN Ppe ON Transportation.RecordNo = Ppe.PpeDetailsId RIGHT OUTER JOIN TransferItem ON Ppe.RecordNo = TransferItem.PpeId WHERE (TransferItem.TransferDocumentId = " +
            docNo +
            ") AND (TransferItem.isDeleted = 0)";
          return pool.request().query(query);
        })
        .then((result) => {
          noOfItems = result.recordset.length;
          for (let i = 0; i < noOfItems; i++) {
            tempTotalCost = tempTotalCost + result.recordset[i].Cost;
          }
        })
        .catch((err) => {
          console.log(err);
          sql.close();
        });

      await new sql.ConnectionPool(DBConfig)
        .connect()
        .then((pool) => {
          // Query
          let query =
            "Update Transportation SET CurrentLocation = " +
            lastLocation +
            ", CurrentOffice = " +
            lastOffice +
            ", CurrentOfficerId = " +
            lastEmployee +
            " WHERE RecordNo = " +
            transportationId +
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
    }

    await new sql.ConnectionPool(DBConfig)
      .connect()
      .then((pool) => {
        // Query
        let query =
          "UPDATE TransferDocuments SET TotalAmount = " +
          tempTotalCost +
          " WHERE RecordNo = " +
          docNo +
          "";
        return pool.request().query(query);
      })
      .then((result) => {
        console.log("Amount Updated Successfully!");
      })
      .catch((err) => {
        console.log(err);
        sql.close();
      });

    //Audit Trail Add (For Delete Item)
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
        await console.log("Audit Trail (For Delete Item) Added Successfully");
      })
      .catch(async (err) => {
        await console.log(err);
        await sql.close();
      });

    res.json(0);
    sql.close();
  }
});

module.exports = router;
