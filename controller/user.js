import { Admin } from "../model/Admin.js"
import { Employee } from "../model/Employee.js"
import crypto from "crypto";
import dotenv from 'dotenv'
dotenv.config()

//update profile Image
export const updateProfileImage = async (req, res) => {
  const out = {}
  try {
    const emp_id = req.body.emp_id
    if (!emp_id) throw Error("emp_id is required")

    out.message = "success"
    out.error = false
    out.data = await Employee.updateOne({ emp_id: emp_id }, { $set: { profile_img: req.body.profile_img } })
  } catch (err) {
    out.message = err.message
    out.error = true
    out.data = null
  } finally {
    //setting the output
    res.send(out)
  }
}

//get the detail of a particular user (Using)
export const getUser = async (req, res) => {
  const out = {}
  try {
    const emp_id = req.body.emp_id
    if (!emp_id) throw Error("emp_id is required")

    const results = await Employee.findOne({ emp_id: emp_id }, [
      "emp_id",
      "email",
      "name",
      "dob",
      "phone",
      "designation",
      "department",
      "profile_img",
    ])

    out.error = !results

    out.message = out.error ? "User Not found" : "success"
    out.data = out.error ? null : results
  } catch (err) {
    out.message = err.message
    out.error = true
    out.data = null
  } finally {
    //setting the output
    res.send(out)
  }
}

//get details on all users (Using)
export const getUsers = async (req, res) => {
  const out = {}
  try {

    const users = await Employee.find({}, [
      "emp_id",
      "email",
      "name",
      "dob",
      "phone",
      "designation",
      "department",
      "profile_img"
    ])

    out.message = "success"
    out.error = false
    out.data = users
  } catch (err) {
    out.message = err.message
    out.error = true
    out.data = null
  } finally {
    //setting the output
    res.send(out)
  }
}
// export const getUsers = async (req, res) => {
//   const out = {}
//   try {
//     const pageNumber = parseInt(req.body.current_page) || 1
//     const itemPerPage = 10
//     const total = await Employee.find({}, ["emp_id"]).countDocuments()

//     const users = await Employee.find({}, [
//       "emp_id",
//       "email",
//       "name",
//       "dob",
//       "phone",
//       "designation",
//       "department",
//       "profile_img"
//     ])
//       .sort({ name: "asc" })
//       .skip(pageNumber > 1 ? (pageNumber - 1) * itemPerPage : 0)
//       .limit(itemPerPage)

//     out.message = "success"
//     out.error = false
//     out.current_page = pageNumber
//     out.item_perpage = itemPerPage
//     out.total_page = Math.ceil(total / itemPerPage)
//     out.total_items = total
//     out.data = users
//   } catch (err) {
//     out.message = err.message
//     out.error = true
//     out.data = null
//   } finally {
//     //setting the output
//     res.send(out)
//   }
// }




// ADMIN
export const registerNewUser = async (req, res) => {
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
      name: req.body.name,
      phone: req.body.phone,
      jv_partner: req.body.jv_partner,
      expert_input: req.body.expert_input,
      dob: req.body.dob,
      designation: req.body.designation,
      department: req.body.department,
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

export const getLatestFiveUser = async (req, res) => {
  const out = {};
  try {

    const emp = await Employee.find().sort({ emp_id: -1 }).limit(5)

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

export const getPersonalDetail = async (req, res) => {
  const out = {}
  try {

    const data = await Admin.findOne({ _id: req.body._id })
    if (!data) {
      out.message = "No such User"
      out.error = true
      out.data = null
    }

    out.message = "Successfull"
    out.error = false
    out.data = data

  } catch (err) {
    out.message = err.message;
    out.error = true;
    out.data = null;
  }
  finally {
    res.send(out)
  }
}

export const updateAdminPersonalDetail = async (req, res) => {
  const out = {}
  try {

    const data = await Admin.findOne({ _id: req.body._id })
    if (!data) {
      out.message = "No such User"
      out.error = true
      out.data = null
    }

    const updateData = await Admin.updateOne(
      { _id: req.body._id },
      {
        $set: {
          name: req.body.values.name,
          email: req.body.values.email,
          phone: req.body.values.phone,
        }
      }
    )

    out.message = "The profile is successfully updated"
    out.error = false
    out.data = updateData

  } catch (err) {
    out.message = err.message;
    out.error = true;
    out.data = null;
  }
  finally {
    res.send(out)
  }
}

export const updateAdminPassword = async (req, res) => {
  const out = {}
  try {

    const checkAmin = await Admin.findOne({ _id: req.body._id })
    if (!checkAmin) {
      out.message = "No such User"
      out.error = true
      out.data = null
    }

    const hash = crypto
      .createHmac("sha256", process.env.PASSWORD_KEY)
      .update(req.body.values.oldPassword)
      .digest("hex");

    if (hash === checkAmin.password) {

      const newHashed = crypto
        .createHmac("sha256", process.env.PASSWORD_KEY)
        .update(req.body.values.password)
        .digest("hex");

      const updatePassword = await Admin.updateOne(
        { _id: req.body._id },
        {
          $set: {
            password: newHashed
          }
        }
      )

      out.message = "Password is successfully Updated"
      out.error = false
      out.data = updatePassword
    } else {
      out.message = "The old password is wrong!"
      out.error = true
      out.data = null
    }

  } catch (err) {
    out.message = err.message;
    out.error = true;
    out.data = null;
  }
  finally {
    res.send(out)
  }
}

export const getSingleUserDetail = async (req, res) => {
  const out = {}
  try {
    const emp_id = req.body.emp_id
    if (!emp_id) throw Error("emp_id is required")

    const results = await Employee.findOne({ emp_id: emp_id })

    out.error = !results

    out.message = out.error ? "User Not found" : "success"
    out.data = out.error ? null : results
  } catch (err) {
    out.message = err.message
    out.error = true
    out.data = null
  } finally {
    //setting the output
    res.send(out)
  }
}



// EXTRAS=============================================
//SEARCH by Name
export const searchUser = async (req, res) => {
  const out = {}
  try {
    const query = req.body.query
    if (!query) throw Error("query is required")

    const pageNumber = parseInt(req.body.current_page) || 1
    const itemPerPage = 10
    const total = await Employee.find(
      {
        name: {
          $regex: query,
          $options: "i",
        },
      },
      ["emp_id"]
    ).countDocuments()

    const user = await Employee.find(
      {
        name: {
          $regex: query,
          $options: "i",
        },
      },
      ["emp_id", "email", "name", "join_date", "phone", "designation", "department", "status"]
    )
      .sort({ name: "asc" })
      .skip(pageNumber > 1 ? (pageNumber - 1) * itemPerPage : 0)
      .limit(itemPerPage)

    out.message = "success"
    out.error = false
    out.current_page = pageNumber
    out.item_perpage = itemPerPage
    out.total_page = Math.ceil(total / itemPerPage)
    out.total_items = total
    out.data = user
  } catch (err) {
    out.message = err.message
    out.error = true
    out.data = null
  } finally {
    //setting the output
    res.send(out)
  }
}

// Search using depart, desig and service
export const filterList = async (req, res) => {
  const out = {}
  try {
    const conditions = []
    if (req.body.status) {
      if (isNaN(req.body.status)) {
        if (req.body.status.toLowerCase() === 'active')
          conditions.push({ status: { $in: [0, 3, 4] } })
        else if (req.body.status.toLowerCase() === 'inactive')
          conditions.push({ status: { $in: [1, 2] } })
        else
          throw new Error('Employee Status code is invalid')
      } else
        conditions.push(
          { 'status': req.body.status },
        )
    }

    if (req.body.designation)
      conditions.push(
        { 'designation': req.body.designation },
      )

    if (req.body.department)
      conditions.push(
        { 'department': req.body.department },
      )

    // console.log(req.body)
    const pageNumber = parseInt(req.body.current_page) || 1
    const itemPerPage = 10
    const total = await Employee
      .find(conditions.length > 0 ? { $and: conditions } : {})
      .countDocuments()

    const projects = await Employee
      .find(conditions.length > 0 ? { $and: conditions } : {})
      .sort({ title: "asc" })
      .skip(pageNumber > 1 ? ((pageNumber - 1) * itemPerPage) : 0)
      .limit(itemPerPage)

    out.message = "success"
    out.error = false
    out.current_page = pageNumber
    out.item_perpage = itemPerPage
    out.total_page = Math.ceil(total / itemPerPage)
    out.total_items = total
    out.data = projects
  } catch (err) {
    out.message = err.message
    out.error = true
    out.data = null
  } finally {
    //setting the output
    res.send(out)
  }
}

//DELETE user
export const deleteUser = async (req, res) => {
  const out = {}
  try {
    const emp_id = req.body.emp_id
    if (!emp_id) throw Error("emp_id is required")

    await Employee.deleteOne({ emp_id: emp_id })

    out.message = "success"
    out.error = false
    out.data = emp_id + "deleted"
  } catch (err) {
    out.message = err.message
    out.error = true
    out.data = null
  } finally {
    //setting the output
    res.send(out)
  }
}
