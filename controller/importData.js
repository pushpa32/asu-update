import { Employee } from "../model/Employee.js";
import crypto from "crypto";
import pkg from "xlsx";

export function getProfessionalTax(gross) {
  if (gross <= 10000) return 0;
  else if ((gross > 10000) & (gross < 15000)) return 150;
  else if ((gross >= 15000) & (gross < 25000)) return 180;
  else return 208;
}

function getTextDate(stringDate) {
  const date = stringDate ? new Date(Date.parse(stringDate)) : new Date();
  const month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  return date.getFullYear() + "-" + month + "-" + date.getDate();
}

async function saveEmp(data) {
  if (!data.emp.email) throw new Error("Email Not Found");

  //checking if the an employee already exist with the same email id
  const userCheck = await Employee.findOne({ email: data.emp.email }, ["email",]);

  if (userCheck) throw Error("Email already registered");

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

  //elements for password hasing
  const passName = data.emp.name.substring(0, 3 + 1).toUpperCase();
  // const dob = getTextDate("1996-12-12");
  // const passYear = dob.split("-")[0];
  const passYear = "1996";

  //hashing plain  text password
  const hash = crypto
    .createHmac("sha256", data.emp.email)
    .update(passName + passYear)
    .digest("hex");

  const emp = new Employee({
    emp_id: emp_id,
    email: data.emp.email,
    password: hash,
    name: data.emp.name,
    phone: data.emp.phone,
    jv_partner: data.emp.jv_partner,
    expert_input: data.emp.expert_input,
    designation: data.emp.designation,
  });

  await emp.save();

  return emp.name;
}

export const importEmp = async (req, res) => {
  const out = {};
  try {
    const file = pkg.read(req.files.file.data, {
      type: "buffer",
      cellDates: true,
      cellNF: false,
      cellText: false,
    });

    const data = [];
    var temp = pkg.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
    for (let i = 0; i < temp.length; i++) {
      const res = temp[i];
      const emp = {};
      emp.name = res["Resource Name"];
      emp.jv_partner = res["JV partner"];
      emp.designation = res["Designation"];
      emp.expert_input = res["Expert's input"];
      emp.phone = res["Contact Number"];
      emp.email = res["Email ID"];

      // if (!emp.email) emp.email = res["Personal Email ID"];

      // emp.phone = res["Mobile No."];
      // emp.dob = res["DOB"];
      // emp.designation = res["Designation"];
      // emp.join_date = res["DOJ"];

      // const personalDetail = {};
      // personalDetail.qualification = res["Highest\r\nQualification"]
      //   ? res["Highest\r\nQualification"]
      //   : "NA";
      // personalDetail.father_name = res["Fathers Name"]
      //   ? res["Fathers Name"]
      //   : "NA";
      // personalDetail.marital = res["Martial Status"]
      //   ? res["Martial Status"].toLowerCase() === "married"
      //     ? 1
      //     : 2
      //   : 2;
      // personalDetail.gender = res["Gender"]
      //   ? res["Gender"].toLowerCase() === "male"
      //     ? 1
      //     : 2
      //   : 1;
      // personalDetail.aadhar_number = res["Fathers Name"]
      //   ? res["Aadhaar No."]
      //   : 0;

      // const bank = {};
      // bank.account_no = res["Fathers Name"] ? res["A/c no"] : "NA";
      // bank.ifsc = res["Fathers Name"] ? res["IFSC code"] : "NA";
      // bank.esic = res["ESIC Number"] ? res["ESIC Number"] : "NA";
      // bank.pan_number = res["PAN No."] ? res["PAN No."] : "NA";
      // bank.uan = res["UAN No.\r\n"] ? res["UAN No.\r\n"] : "NA";

      try {
        const name = await saveEmp({
          emp: emp,
        });
        data.push({
          name: name,
          error: false,
          message: "success",
        });
      } catch (err) {
        data.push({
          name: emp.name,
          error: true,
          message: err.message,
        });
      }
    }

    out.error = false;
    out.message = "success";
    out.data = data;
  } catch (err) {
    out.message = err.message;
    out.error = true;
    out.data = null;
  } finally {
    //setting the output
    res.send(out);
  }
};

//original
// export const importEmp = async (req, res) => {
//   const out = {};
//   try {
//     const file = pkg.read(req.files.file.data, {
//       type: "buffer",
//       cellDates: true,
//       cellNF: false,
//       cellText: false,
//     });

//     const data = [];
//     var temp = pkg.utils.sheet_to_json(file.Sheets[file.SheetNames[0]]);
//     for (let i = 0; i < temp.length; i++) {
//       const res = temp[i];
//       const emp = {};
//       emp.name = res["Employee Name"];
//       emp.email = res["Official Email ID"];

//       if (!emp.email) emp.email = res["Personal Email ID"];

//       emp.phone = res["Mobile No."];
//       emp.dob = res["DOB"];
//       emp.designation = res["Designation"];
//       emp.join_date = res["DOJ"];

//       const personalDetail = {};
//       personalDetail.qualification = res["Highest\r\nQualification"]
//         ? res["Highest\r\nQualification"]
//         : "NA";
//       personalDetail.father_name = res["Fathers Name"]
//         ? res["Fathers Name"]
//         : "NA";
//       personalDetail.marital = res["Martial Status"]
//         ? res["Martial Status"].toLowerCase() === "married"
//           ? 1
//           : 2
//         : 2;
//       personalDetail.gender = res["Gender"]
//         ? res["Gender"].toLowerCase() === "male"
//           ? 1
//           : 2
//         : 1;
//       personalDetail.aadhar_number = res["Fathers Name"]
//         ? res["Aadhaar No."]
//         : 0;

//       const bank = {};
//       bank.account_no = res["Fathers Name"] ? res["A/c no"] : "NA";
//       bank.ifsc = res["Fathers Name"] ? res["IFSC code"] : "NA";
//       bank.esic = res["ESIC Number"] ? res["ESIC Number"] : "NA";
//       bank.pan_number = res["PAN No."] ? res["PAN No."] : "NA";
//       bank.uan = res["UAN No.\r\n"] ? res["UAN No.\r\n"] : "NA";

//       try {
//         const name = await saveEmp({
//           emp: emp,
//           personal_info: personalDetail,
//           bank: bank,
//         });
//         data.push({
//           name: name,
//           error: false,
//           message: "success",
//         });
//       } catch (err) {
//         data.push({
//           name: emp.name,
//           error: true,
//           message: err.message,
//         });
//       }
//     }

//     out.error = false;
//     out.message = "success";
//     out.data = data;
//   } catch (err) {
//     out.message = err.message;
//     out.error = true;
//     out.data = null;
//   } finally {
//     //setting the output
//     res.send(out);
//   }
// };

