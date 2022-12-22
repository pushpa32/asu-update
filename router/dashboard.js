import express from "express"
import { getAdminDashboad, getEmpDashboard, getDashboardDetail } from "../controller/dashboard.js";

export const dashboard = express.Router()

dashboard.post("/admin/dashboard/detail", getDashboardDetail);


dashboard.post('/emp', getEmpDashboard)
dashboard.post('/admin', getAdminDashboad)


//404
dashboard.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
});