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

//Fetch Transfer Locations (✓)
router.get("/getTransferLocations", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query = "SELECT * FROM TransferLocation ORDER BY TransferLocation";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Transfer Locations Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Transfer Documents By Transfer Document Id (✓)
router.get("/getTransferDocumentById/:transferDocumentId", function (req, res) {
  let transferDocumentId = req.params.transferDocumentId;
  //Database Connection
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM TransferDocumentView WHERE TransferDocumentId = " +
        transferDocumentId +
        "";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Transfer Document Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Transfer Documents By Ppe (✓)
router.get("/getTransferDocumentsByPpe/:ppeId", async function (req, res) {
  let ppeId = req.params.ppeId;
  await new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM TransferDocumentListByPpeView WHERE PpeId = " +
        ppeId +
        " ORDER BY YearTransferred DESC, MonthTransferred DESC, DayTransferred DESC";
      console.log(query);
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Transfer Documents By Ppe Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Equipment Items From Transfer Document (✓)
router.get("/getDocumentEqItems/:docNo", function (req, res) {
  let docNo = req.params.docNo;
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM TransferItemEquipmentDetailsView WHERE TransferDocumentId = " +
        docNo +
        " ORDER BY PropertyNo";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Equipment Items From Transfer Item Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch Vehicle Items From Transfer Document (✓)
router.get("/getDocumentVehicleItems/:docNo", function (req, res) {
  let docNo = req.params.docNo;
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM TransferItemVehicleDetailsView WHERE TransferDocumentId = " +
        docNo +
        " ORDER BY VehicleId";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch Vehicle Items From Transfer Item Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch PAR (✓)
router.get("/getPar", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM TransferDocumentView WHERE DocumentTypeId = 1 ORDER BY YearTransferred DESC, MonthTransferred DESC, DayTransferred DESC";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch PAR List Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

//Fetch ICS (✓)
router.get("/getIcs", function (req, res) {
  new sql.ConnectionPool(DBConfig)
    .connect()
    .then((pool) => {
      // Query
      let query =
        "SELECT * FROM TransferDocumentView WHERE DocumentTypeId = 2 ORDER BY YearTransferred DESC, MonthTransferred DESC, DayTransferred DESC";
      return pool.request().query(query);
    })
    .then((result) => {
      console.log("Fetch ICS List Successfully!");
      res.json(result.recordset);
      sql.close();
    })
    .catch((err) => {
      console.log(err);
      sql.close();
    });
});

// //Fetch Item List By Office (To Follow)
// router.post("/getItemListPerOffice", function (req, res) {
//   let propType = parseInt(req.body.propType);
//   let fromLocation = parseInt(req.body.fromLocation);
//   let fromOffice = parseInt(req.body.fromOffice);
//   let transactionType = req.body.transactionType;
//   let selectedItems = req.body.selectedItems;
//   if (transactionType === "Edit") {
//     if (propType === 5) {
//       new sql.ConnectionPool(DBConfig)
//         .connect()
//         .then((pool) => {
//           // Query
//           let query =
//             "SELECT PropertyType.PropertyType, Transportation.RecordNo, Transportation.Remarks, Transportation.TransportationTypeId, Transportation.PresentConditionId, Transportation.Quantity, Transportation.EquipmentCode, Transportation.VehicleNo, Transportation.PropertyNo, Transportation.ConductionStickerNo, Transportation.PlateNo, Transportation.MvFileNo, Transportation.CrNo, Transportation.EngineNo, Transportation.ChassisNo, Transportation.PolicyNo, Transportation.InsuranceValidityUntil, Transportation.DateOfLastLtoReceipt, Transportation.MonthAcquired, Transportation.DayAcquired, Transportation.YearAcquired, Transportation.FullDateAcquired, Transportation.Cost, Transportation.ConditionAsOf, Transportation.isDeleted, Transportation.FullDateAdded, Ppe.RecordNo AS PpeId, HeavyEquipmentType_1.HeavyEquipment, StatusOfDocument.StatusOfDocument, VehicleModel.Model, Color.Color, Condition.Condition, Condition.ConditionLegend, CASE WHEN Transportation.CurrentLocation = 1 THEN (SELECT BarangayName FROM Barangay WHERE Transportation.CurrentOffice = Barangay.RecordNo) WHEN Transportation.CurrentLocation = 2 THEN (SELECT OfficeName FROM Office WHERE Transportation.CurrentOffice = Office.RecordNo) END AS CurrentOffice, CASE WHEN Transportation.CurrentLocation = 1 THEN (SELECT BarangayOfficerName FROM BarangayOfficer WHERE Transportation.CurrentOfficerId = BarangayOfficer.RecordNo) WHEN Transportation.CurrentLocation = 2 THEN (SELECT EmployeeName FROM OfficeEmployees WHERE Transportation.CurrentOfficerId = OfficeEmployees.RecordNo) END AS CurrentOfficer, CASE WHEN Transportation.CurrentLocation = 1 THEN (SELECT Position FROM BarangayOfficer WHERE Transportation.CurrentOfficerId = BarangayOfficer.RecordNo) WHEN Transportation.CurrentLocation = 2 THEN (SELECT Position FROM OfficeEmployees WHERE Transportation.CurrentOfficerId = OfficeEmployees.RecordNo) END AS Position, TransportationType.TransportationType FROM Ppe INNER JOIN PropertyType ON Ppe.PropertyTypeId = PropertyType.RecordNo INNER JOIN Transportation ON Ppe.PpeDetailsId = Transportation.RecordNo LEFT OUTER JOIN TransportationType ON Transportation.TransportationTypeId = TransportationType.RecordNo LEFT OUTER JOIN Condition ON Transportation.PresentConditionId = Condition.RecordNo LEFT OUTER JOIN StatusOfDocument ON Transportation.StatusOfDocumentId = StatusOfDocument.RecordNo LEFT OUTER JOIN Color ON Transportation.ColorId = Color.RecordNo LEFT OUTER JOIN VehicleModel ON Transportation.VehicleModelId = VehicleModel.RecordNo LEFT OUTER JOIN HeavyEquipmentType AS HeavyEquipmentType_1 ON Transportation.HeavyEquipmentTypeId = HeavyEquipmentType_1.RecordNo WHERE (Ppe.PropertyTypeId = 5) AND (Ppe.isCondemned = 0) AND Transportation.CurrentLocation = " +
//             fromLocation +
//             " AND Transportation.CurrentOffice = " +
//             fromOffice +
//             " ORDER BY Transportation.RecordNo";
//           return pool.request().query(query);
//         })
//         .then((result) => {
//           let itemList = result.recordset;
//           for (let h = 0; h < selectedItems.length; h++) {
//             for (let i = 0; i < itemList.length; i++) {
//               if (itemList[i].RecordNo === selectedItems[h].RecordNo) {
//                 itemList.splice(i, 1);
//               }
//             }
//           }

//           console.log(
//             "Fetch Item List (Transportation) Per Office Sucessfully!"
//           );
//           res.json(itemList);
//           sql.close();
//         })
//         .catch((err) => {
//           console.log(err);
//           sql.close();
//         });
//     } else if (propType === 2) {
//       new sql.ConnectionPool(DBConfig)
//         .connect()
//         .then((pool) => {
//           // Query
//           let query =
//             "SELECT Equipment.RecordNo, ItemType.ItemType, Supplier.SupplierName, Ppe.isCondemned, PropertyType.PropertyType, CASE WHEN Equipment.CurrentLocation = 1 THEN (SELECT BarangayName FROM Barangay WHERE Equipment.CurrentOffice = Barangay.RecordNo) WHEN Equipment.CurrentLocation = 2 THEN (SELECT OfficeName FROM Office WHERE Equipment.CurrentOffice = Office.RecordNo) END AS CurrentOffice, CASE WHEN Equipment.CurrentLocation = 1 THEN (SELECT BarangayOfficerName FROM BarangayOfficer WHERE Equipment.CurrentOfficerId = BarangayOfficer.RecordNo) WHEN Equipment.CurrentLocation = 2 THEN (SELECT EmployeeName FROM OfficeEmployees WHERE Equipment.CurrentOfficerId = OfficeEmployees.RecordNo) END AS CurrentOfficer, CASE WHEN Equipment.CurrentLocation = 1 THEN (SELECT Position FROM BarangayOfficer WHERE Equipment.CurrentOfficerId = BarangayOfficer.RecordNo) WHEN Equipment.CurrentLocation = 2 THEN (SELECT Position FROM OfficeEmployees WHERE Equipment.CurrentOfficerId = OfficeEmployees.RecordNo) END AS Position, Equipment.PropertyNo, Equipment.OsNo, Equipment.PoNo, Equipment.Quantity, Equipment.Description, Equipment.SerialNo, Equipment.UnitCost,  Equipment.TotalAcquisition, Equipment.Remarks, Equipment.AccountCode, Equipment.MonthAcquired, Equipment.DayAcquired, Equipment.YearAcquired, Equipment.FullDateAcquired, Equipment.UnitId, Ppe.RecordNo AS PpeId FROM Equipment INNER JOIN ItemType ON Equipment.ItemId = ItemType.RecordNo INNER JOIN Supplier ON Equipment.SupplierId = Supplier.RecordNo INNER JOIN Ppe ON Equipment.RecordNo = Ppe.PpeDetailsId INNER JOIN PropertyType ON Ppe.PropertyTypeId = PropertyType.RecordNo  WHERE (Ppe.PropertyTypeId = 2) AND (Ppe.isCondemned = 0) AND Equipment.CurrentLocation = " +
//             fromLocation +
//             " AND Equipment.CurrentOffice = " +
//             fromOffice +
//             " ORDER BY Equipment.PropertyNo";
//           return pool.request().query(query);
//         })
//         .then(async (result) => {
//           let itemList = result.recordset;
//           for (let h = 0; h < selectedItems.length; h++) {
//             for (let i = 0; i < itemList.length; i++) {
//               if (itemList[i].RecordNo === selectedItems[h].RecordNo) {
//                 itemList.splice(i, 1);
//               }
//             }
//           }
//           console.log("Fetch Item List (Equipment) Per Office Sucessfully!");
//           res.json(itemList);
//           sql.close();
//         })
//         .catch((err) => {
//           console.log(err);
//           sql.close();
//         });
//     }
//   } else if (transactionType === "Add") {
//     if (propType === 5) {
//       new sql.ConnectionPool(DBConfig)
//         .connect()
//         .then((pool) => {
//           // Query
//           let query =
//             "SELECT PropertyType.PropertyType, Transportation.RecordNo, Transportation.Remarks, Transportation.TransportationTypeId, Transportation.PresentConditionId, Transportation.Quantity, Transportation.EquipmentCode, Transportation.VehicleNo, Transportation.PropertyNo, Transportation.ConductionStickerNo, Transportation.PlateNo, Transportation.MvFileNo, Transportation.CrNo, Transportation.EngineNo, Transportation.ChassisNo, Transportation.PolicyNo, Transportation.InsuranceValidityUntil, Transportation.DateOfLastLtoReceipt, Transportation.MonthAcquired, Transportation.DayAcquired, Transportation.YearAcquired, Transportation.FullDateAcquired, Transportation.Cost, Transportation.ConditionAsOf, Transportation.isDeleted, Transportation.FullDateAdded, Ppe.RecordNo AS PpeId, HeavyEquipmentType_1.HeavyEquipment, StatusOfDocument.StatusOfDocument, VehicleModel.Model, Color.Color, Condition.Condition, Condition.ConditionLegend, CASE WHEN Transportation.CurrentLocation = 1 THEN (SELECT BarangayName FROM Barangay WHERE Transportation.CurrentOffice = Barangay.RecordNo) WHEN Transportation.CurrentLocation = 2 THEN (SELECT OfficeName FROM Office WHERE Transportation.CurrentOffice = Office.RecordNo) END AS CurrentOffice, CASE WHEN Transportation.CurrentLocation = 1 THEN (SELECT BarangayOfficerName FROM BarangayOfficer WHERE Transportation.CurrentOfficerId = BarangayOfficer.RecordNo) WHEN Transportation.CurrentLocation = 2 THEN (SELECT EmployeeName FROM OfficeEmployees WHERE Transportation.CurrentOfficerId = OfficeEmployees.RecordNo) END AS CurrentOfficer, CASE WHEN Transportation.CurrentLocation = 1 THEN (SELECT Position FROM BarangayOfficer WHERE Transportation.CurrentOfficerId = BarangayOfficer.RecordNo) WHEN Transportation.CurrentLocation = 2 THEN (SELECT Position FROM OfficeEmployees WHERE Transportation.CurrentOfficerId = OfficeEmployees.RecordNo) END AS Position, TransportationType.TransportationType FROM Ppe INNER JOIN PropertyType ON Ppe.PropertyTypeId = PropertyType.RecordNo INNER JOIN Transportation ON Ppe.PpeDetailsId = Transportation.RecordNo LEFT OUTER JOIN TransportationType ON Transportation.TransportationTypeId = TransportationType.RecordNo LEFT OUTER JOIN Condition ON Transportation.PresentConditionId = Condition.RecordNo LEFT OUTER JOIN StatusOfDocument ON Transportation.StatusOfDocumentId = StatusOfDocument.RecordNo LEFT OUTER JOIN Color ON Transportation.ColorId = Color.RecordNo LEFT OUTER JOIN VehicleModel ON Transportation.VehicleModelId = VehicleModel.RecordNo LEFT OUTER JOIN HeavyEquipmentType AS HeavyEquipmentType_1 ON Transportation.HeavyEquipmentTypeId = HeavyEquipmentType_1.RecordNo WHERE (Ppe.PropertyTypeId = 5) AND (Ppe.isCondemned = 0) AND Transportation.CurrentLocation = " +
//             fromLocation +
//             " AND Transportation.CurrentOffice = " +
//             fromOffice +
//             " ORDER BY Transportation.RecordNo";
//           return pool.request().query(query);
//         })
//         .then((result) => {
//           console.log(
//             "Fetch Item List (Transportation) Per Office Sucessfully!"
//           );
//           res.json(result.recordset);
//           sql.close();
//         })
//         .catch((err) => {
//           console.log(err);
//           sql.close();
//         });
//     } else if (propType === 2) {
//       new sql.ConnectionPool(DBConfig)
//         .connect()
//         .then((pool) => {
//           // Query
//           let query =
//             "SELECT Equipment.RecordNo, ItemType.ItemType, Supplier.SupplierName, Ppe.isCondemned, PropertyType.PropertyType, CASE WHEN Equipment.CurrentLocation = 1 THEN (SELECT BarangayName FROM Barangay WHERE Equipment.CurrentOffice = Barangay.RecordNo) WHEN Equipment.CurrentLocation = 2 THEN (SELECT OfficeName FROM Office WHERE Equipment.CurrentOffice = Office.RecordNo) END AS CurrentOffice, CASE WHEN Equipment.CurrentLocation = 1 THEN (SELECT BarangayOfficerName FROM BarangayOfficer WHERE Equipment.CurrentOfficerId = BarangayOfficer.RecordNo) WHEN Equipment.CurrentLocation = 2 THEN (SELECT EmployeeName FROM OfficeEmployees WHERE Equipment.CurrentOfficerId = OfficeEmployees.RecordNo) END AS CurrentOfficer, CASE WHEN Equipment.CurrentLocation = 1 THEN (SELECT Position FROM BarangayOfficer WHERE Equipment.CurrentOfficerId = BarangayOfficer.RecordNo) WHEN Equipment.CurrentLocation = 2 THEN (SELECT Position FROM OfficeEmployees WHERE Equipment.CurrentOfficerId = OfficeEmployees.RecordNo) END AS Position, Equipment.PropertyNo, Equipment.OsNo, Equipment.PoNo, Equipment.Quantity, Equipment.Description, Equipment.SerialNo, Equipment.UnitCost,  Equipment.TotalAcquisition, Equipment.Remarks, Equipment.AccountCode, Equipment.MonthAcquired, Equipment.DayAcquired, Equipment.YearAcquired, Equipment.FullDateAcquired, Equipment.UnitId, Ppe.RecordNo AS PpeId FROM Equipment INNER JOIN ItemType ON Equipment.ItemId = ItemType.RecordNo INNER JOIN Supplier ON Equipment.SupplierId = Supplier.RecordNo INNER JOIN Ppe ON Equipment.RecordNo = Ppe.PpeDetailsId INNER JOIN PropertyType ON Ppe.PropertyTypeId = PropertyType.RecordNo  WHERE (Ppe.PropertyTypeId = 2) AND (Ppe.isCondemned = 0) AND Equipment.CurrentLocation = " +
//             fromLocation +
//             " AND Equipment.CurrentOffice = " +
//             fromOffice +
//             " ORDER BY Equipment.PropertyNo";
//           return pool.request().query(query);
//         })
//         .then((result) => {
//           console.log("Fetch Item List (Equipment) Per Office Sucessfully!");
//           res.json(result.recordset);
//           sql.close();
//         })
//         .catch((err) => {
//           console.log(err);
//           sql.close();
//         });
//     }
//   }
// });

module.exports = router;
