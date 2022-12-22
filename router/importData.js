import express from "express";
import { importEmp } from "../controller/importData.js";

export const importdata = express.Router();

importdata.post('/emp', importEmp)


//404
importdata.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});
