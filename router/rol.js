import express from 'express'
import { login, register, hrRegister, changePassword, adminRegister, adminLogin, superAdminRegister, superAdminLogin, loginPhone, otpVerify } from '../controller/rol.js'

export const rol = express.Router()

//Admins
rol.post("/otp/verify", otpVerify)
rol.post("/otp/generate", loginPhone)

//Admins
rol.post("/admin/register", adminRegister)
rol.post("/admin/login", adminLogin)

rol.post("/superadmin/register", superAdminRegister)
rol.post("/superadmin/login", superAdminLogin)

rol.post("/hr/register", hrRegister)

//login
rol.post("/login", login)

//register
rol.post("/register", register)


//Change password
rol.post("/change/password", changePassword)

//404
rol.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
})