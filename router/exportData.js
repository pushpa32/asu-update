import express from "express";
import { exportAttendance, exportAttendanceByRange, exportAttendanceByMonth, exportEmp } from "../controller/exportData.js";
import { verifyAdmin } from "../utils/verifyToken.js";

export const exportdata = express.Router();

//In Use
exportdata.post('/attendance/month', verifyAdmin, exportAttendanceByMonth)
exportdata.post('/attendance/byRange', verifyAdmin, exportAttendanceByRange)


//Not In Use
exportdata.post('/emp', exportEmp)
exportdata.post('/attendance', exportAttendance)

//404
exportdata.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});
