import express from "express"
import { rol } from "../router/rol.js"
import { attendance } from "../router/attendance.js"
import { user } from "../router/user.js"
// import { casualLeave } from "../router/leave.js"
import { department } from "../router/department.js"
import { designation } from "../router/designation.js"
import { upload } from "../router/upload.js"
import { importdata } from "./importData.js"
import { exportdata } from "./exportData.js"
import { dashboard } from "./dashboard.js"
// import { medicalLeave } from "./medicalleave.js"

export const api = express.Router()

api.use("/rol", rol)

api.use("/user", user)

api.use("/attendance", attendance)

api.use("/dashboard", dashboard)


// api.use("/leave/casual", casualLeave)
// api.use("/leave/medical", medicalLeave)

api.use("/department", department)

api.use("/designation", designation)

api.use("/upload", upload)

api.use("/import", importdata)

api.use("/export", exportdata)


//404: wrong path
api.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
});