import { Employee } from "../model/Employee.js";
import crypto from "crypto";
import { Admin } from '../model/Admin.js';
import { SuperAdmin } from './../model/SuperAdmin.js';
import Jwt from "jsonwebtoken"
import { HR } from "../model/HR.js";
import dotenv from 'dotenv'
dotenv.config()


// Otp Verify
export const otpVerify = async (req, res) => {
  const out = {};
  try {
    if (!req.body.phone) throw new Error("Provide Phone Number!")

    const checkUser = await Employee.findOne({ phone: req.body.phone });

    if (checkUser) {
      const token = Jwt.sign({ user: checkUser }, process.env.JWT_KEY, { expiresIn: '30d' })

      res.cookie("access_token", token, {
        httpOnly: true
      }).status(200).json(token)
    } else {
      res.send("No user found");
    }
  } catch (err) {
    res.send(err);
  }
};


// Phone login
export const loginPhone = async (req, res) => {
  const out = {};
  try {
    if (!req.body.phone) throw new Error("Provide Phone Number!")
    // if (!req.body.device_id) throw new Error("Provide Device Id!")

    const userCheck = await Employee.findOne({ phone: req.body.phone });

    // let returnedResult = 0;
    if (userCheck) {

      out.message = "success";
      out.error = false;
      out.email = userCheck.email;

    } else {
      out.message = "Wrong Phone Number";
      out.error = true;
      out.email = null;
    }
  } catch (err) {
    out.message = err.message;
    out.error = true;
    out.data = null;
  } finally {
    //setting the output
    res.send(out);
  }
};

//login
export const login = async (req, res) => {
  const out = {};
  try {
    //checking if the an employee exist with the email id
    const conditions = [];
    conditions.push({ email: req.body.email });
    if (req.body.userType) conditions.push({ userType: req.body.userType });

    const userCheck = await Employee.findOne({ $and: conditions });

    if (userCheck) {
      //check the status of the user
      if (
        await Employee.findOne({
          $and: [{ status: { $in: [1, 2] } }, { email: userCheck.email }],
        })
      ) {
        throw Error("Login Access Denied!");
      }

      //passsword checking
      //hashing plain  text password
      const hash = crypto
        .createHmac("sha256", req.body.email)
        .update(req.body.password)
        .digest("hex");
      if (hash.toString().localeCompare(userCheck.password) === 0) {
        out.message = "success";
        out.error = false;
        out.data = userCheck;
      } else throw Error("Wrong password");
    } else throw Error("User not found");
  } catch (err) {
    out.message = err.message;
    out.error = true;
    out.data = null;
  } finally {
    //setting the output
    res.send(out);
  }
};

//register
export const register = async (req, res) => {
  const out = {};
  try {
    /*generating emp_id based on last emp_id if there is no employee exist then 1 will be used as default emp_id
        emp_id format : GT/[Serial Number]/[Last two digit of the current year]
        */
    const last_emp = await Employee.find().sort({ _id: -1 }).limit(1);
    var num = 1;
    if (last_emp.length > 0) {
      num = parseInt(last_emp[0].emp_id.split("/")[1]);
      num += 1;
    }
    const date = new Date();
    let year = date.getFullYear();
    const emp_id =
      "ASU/" +
      (num <= 9
        ? "000" + num
        : num <= 99
          ? "00" + num
          : num <= 999
            ? "0" + num
            : num) +
      "/" +
      year.toString().substring(2);

    //checking if the an employee already exist with the same email id
    const userCheck = await Employee.find(
      {
        $and: [{ email: { $exists: true } }, { email: req.body.email }],
      },
      [req.body.email]
    ).limit(1);

    const userPhone = await Employee.find(
      {
        $and: [{ phone: { $exists: true } }, { phone: req.body.phone }],
      },
      [req.body.phone]
    ).limit(1);

    if (userPhone.length > 0) throw Error("Phone number already registered");
    if (userCheck.length > 0) throw Error("Email already registered");

    const emp = new Employee({
      emp_id: emp_id.toString(),
      email: req.body.email,
      // password: hash,
      name: req.body.name,
      phone: req.body.phone,
      jv_partner: req.body.jv_partner,
      expert_input: req.body.expert_input,
      dob: req.body.dob,
      designation: req.body.designation,
      department: req.body.department,
      join_date: req.body.join_date,
      status: req.body.status,
    });

    await emp.save();
    out.message = "success";
    out.error = false;
    out.data = emp;
  } catch (err) {
    out.message = err.message;
    out.error = true;
    out.data = null;
  } finally {
    //setting the output
    res.send(out);
  }
};

//Admin Register
export const adminRegister = async (req, res) => {
  const out = {};
  try {

    const emailCheck = await Admin.findOne({ email: req.body.email })
    if (emailCheck) throw Error("Email already Exists")

    const last_admin = await Admin.find().sort({ _id: -1 }).limit(1);
    var num = 1;
    if (last_admin.length > 0) {
      num = parseInt(last_admin[0].admin_id.split("/")[1]);
      num += 1;
    }
    const date = new Date();
    let year = date.getFullYear();
    const admin_id =
      "ADMIN/" +
      (num <= 9
        ? "000" + num
        : num <= 99
          ? "00" + num
          : num <= 999
            ? "0" + num
            : num) +
      "/" +
      year.toString().substring(2);

    //elements for password hasing
    // const passName = req.body.name.substring(0, 3 + 1).toUpperCase();
    // const passYear = req.body.dob.split("-")[0];

    //hashing plain  text password
    const hash = crypto
      .createHmac("sha256", process.env.PASSWORD_KEY)
      .update(req.body.password)
      .digest("hex");

    //checking if the an employee already exist with the same email id
    const userCheck = await Admin.find(
      {
        $and: [{ email: { $exists: true } }, { email: req.body.email }],
      },
      [req.body.email]
    ).limit(1);
    // console.log(userCheck)

    if (userCheck.length > 0) throw Error("Email already registered");

    const admin = new Admin({
      admin_id: admin_id.toString(),
      email: req.body.email,
      password: hash,
      name: req.body.name,
      phone: req.body.phone,
      dob: req.body.dob,
    });

    await admin.save();

    out.message = "success";
    out.error = false;
    out.data = admin;
  } catch (err) {
    out.message = err.message;
    out.error = true;
    out.data = null;
  } finally {
    //setting the output
    res.send(out);
  }
};

//super Admin Register
export const superAdminRegister = async (req, res) => {
  const out = {};
  try {
    const last_super_admin = await SuperAdmin.find().sort({ _id: -1 }).limit(1);
    var num = 1;
    if (last_super_admin.length > 0) {
      num = parseInt(last_super_admin[0].superadmin_id.split("/")[1]);
      num += 1;
    }
    const date = new Date();
    let year = date.getFullYear();
    const superadmin_id =
      "SUPERADMIN/" +
      (num <= 9
        ? "000" + num
        : num <= 99
          ? "00" + num
          : num <= 999
            ? "0" + num
            : num) +
      "/" +
      year.toString().substring(2);

    //elements for password hasing
    const passName = req.body.name.substring(0, 3 + 1).toUpperCase();
    const passYear = req.body.dob.split("-")[0];

    //hashing plain  text password
    const hash = crypto
      .createHmac("sha256", req.body.email)
      .update(passName + passYear)
      .digest("hex");

    //checking if the an employee already exist with the same email id
    const userCheck = await SuperAdmin.find(
      {
        $and: [{ email: { $exists: true } }, { email: req.body.email }],
      },
      [req.body.email]
    ).limit(1);
    // console.log(userCheck)

    if (userCheck.length > 0) throw Error("Email already registered");

    const superAdmin = new SuperAdmin({
      superadmin_id: superadmin_id.toString(),
      email: req.body.email,
      password: hash,
      name: req.body.name,
      phone: req.body.phone,
      dob: req.body.dob,
    });

    await superAdmin.save();
    out.message = "success";
    out.error = false;
    out.data = superAdmin;

  } catch (err) {
    out.message = err.message;
    out.error = true;
    out.data = null;
  } finally {
    //setting the output
    res.send(out);
  }
};

//HR Register
export const hrRegister = async (req, res) => {
  const out = {};
  try {

    const emailCheck = await HR.findOne({ email: req.body.email })
    if (emailCheck) throw Error("Email already Exists")

    const last_admin = await Admin.find().sort({ _id: -1 }).limit(1);
    var num = 1;
    if (last_admin.length > 0) {
      num = parseInt(last_admin[0].admin_id.split("/")[1]);
      num += 1;
    }
    const date = new Date();
    let year = date.getFullYear();
    const admin_id =
      "HR/" +
      (num <= 9
        ? "000" + num
        : num <= 99
          ? "00" + num
          : num <= 999
            ? "0" + num
            : num) +
      "/" +
      year.toString().substring(2);

    //elements for password hasing
    const passName = req.body.name.substring(0, 3 + 1).toUpperCase();
    const passYear = req.body.dob.split("-")[0];

    //hashing plain  text password
    const hash = crypto
      .createHmac("sha256", req.body.email)
      .update(passName + passYear)
      .digest("hex");

    //checking if the an employee already exist with the same email id
    const userCheck = await HR.find(
      {
        $and: [{ email: { $exists: true } }, { email: req.body.email }],
      },
      [req.body.email]
    ).limit(1);

    if (userCheck.length > 0) throw Error("Email already registered");

    const hr = new HR({
      hr_id: admin_id.toString(),
      email: req.body.email,
      password: hash,
      name: req.body.name,
      phone: req.body.phone,
      dob: req.body.dob,
    });

    await hr.save();
    out.message = "success";
    out.error = false;
    out.data = hr;
  } catch (err) {
    out.message = err.message;
    out.error = true;
    out.data = null;
  } finally {
    //setting the output
    res.send(out);
  }
};

//Admin Login, HR, SuperAdmin
export const adminLogin = async (req, res) => {
  const out = {}
  try {
    if (!req.body.email) throw new Error("Email is required")
    if (!req.body.password) throw new Error("Password is required")

    let checkUser = await Admin.findOne({ email: req.body.email })

    if (!checkUser) {
      out.message = "No such User!"
      out.error = true;
      out.data = null;
      res.send(out);
    }
    else {
      const hash = crypto
        .createHmac("sha256", process.env.PASSWORD_KEY)
        .update(req.body.password)
        .digest("hex");

      if (hash.toString().localeCompare(checkUser.password) === 0) {
        const token = Jwt.sign({ user: checkUser }, process.env.JWT_KEY, { expiresIn: '30d' })
        // const token = Jwt.sign({ id: checkUser._id, isAdmin: checkUser.isAdmin }, 'PShady', { expiresIn: '30d' })
        res.cookie("access_token", token, {
          httpOnly: true
        }).status(200).json({ data: token })
      } else {
        out.message = "Wrong Password"
        out.error = true;
        out.data = null;
        res.send(out);
      }
    }

    //passsword checking
    //hashing plain  text password

  } catch (err) {
    out.message = err.message
    out.error = true;
    out.data = null;
    res.send(out);
  }
  // finally {
  //   res.send(out)
  // }
};

//super Admin Login
export const superAdminLogin = async (req, res) => {
  try {
    if (!req.body.email) throw new Error("Email is required")
    if (!req.body.password) throw new Error("Password is required")

    const checkUser = await SuperAdmin.findOne({ email: req.body.email })

    if (!checkUser) throw Error("User are not an Admin!")

    //passsword checking
    //hashing plain  text password
    const hash = crypto
      .createHmac("sha256", req.body.email)
      .update(req.body.password)
      .digest("hex");
    if (hash.toString().localeCompare(checkUser.password) === 0) {

      const token = Jwt.sign({ user: checkUser }, 'PShady', { expiresIn: '30d' })
      // const token = Jwt.sign({ id: checkUser._id, isAdmin: checkUser.isAdmin }, 'PShady', { expiresIn: '30d' })

      // const { password, isAdmin, ...otherDetails } = checkUser._doc
      res.cookie("access_token", token, {
        httpOnly: true
      }).status(200).json(token)
    } else throw Error("Wrong password");
  } catch (err) {
    next(err)
  }
};

//change Password
export const changePassword = async (req, res) => {
  const out = {};
  try {
    const emp_id = req.body.emp_id;
    if (!emp_id) throw Error("id is required");

    const userCheck = await Employee.findOne({ emp_id: emp_id });

    if (userCheck) {
      //passsword checking
      const hash = crypto
        .createHmac("sha256", userCheck.email)
        .update(req.body.password)
        .digest("hex");
      if (hash.toString().localeCompare(userCheck.password) === 0) {
        const newHashPassword = crypto
          .createHmac("sha256", userCheck.email)
          .update(req.body.newPassword)
          .digest("hex");

        out.message = "success";
        out.error = false;
        out.data = await Employee.updateOne(
          { emp_id: userCheck.emp_id },
          { $set: { password: newHashPassword } }
        );
      } else throw Error("Wrong Old password");
    } else throw Error("User not found");
  } catch (err) {
    out.message = err.message;
    out.error = true;
    out.data = null;
  } finally {
    //setting the output
    res.send(out);
  }
};
