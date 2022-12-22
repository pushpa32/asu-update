import { Attendance } from "../model/Attendance.js"
import { Employee } from '../model/Employee.js'
import moment from "moment"
import { VerifyActivity } from '../model/VerifyActivities.js';
import { AttendanceStatus } from "../model/AttendanceStatus.js";


// status update final present or absent
export const statusUpdate = async (req, res) => {
    const out = {}
    try {
        if (!req.body.emp_id) throw new Error("Emp_id required")
        if (!req.body.attendance_date) throw new Error("Date In required!")
        // if (!req.body.response_status) throw new Error("Status In required!")

        const empCheck = await Employee.findOne({ emp_id: req.body.emp_id })

        await VerifyActivity.updateOne(
            { emp_id: empCheck._id, attendance_date: req.body.attendance_date },
            {
                $set: {
                    final_verify_status: 1,
                }
            }
        );

        out.message = "success"
        out.error = false
        out.data = await AttendanceStatus.updateOne(
            { emp_id: req.body.emp_id, attendance_date: req.body.attendance_date },
            {
                $set: {
                    response_status: req.body.response_status,
                }
            }
        );
    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null
    } finally {
        //setting the output
        res.send(out)
    }
}

// Attendance Status (Direct present)
export const adminVerifyAttendanceStatus = async (req, res) => {
    const out = {}
    try {
        if (!req.body.emp_id) throw new Error("Emp_id required")
        if (!req.body.response_status) throw new Error("Status In required!")
        if (!req.body.attendance_date) throw new Error("Date In required!")

        const data = new AttendanceStatus({
            emp_id: req.body.emp_id,
            attendance_date: req.body.attendance_date,
            is_admin_responded: 1,
            response_status: req.body.response_status,
        })

        await data.save()

        await VerifyActivity.updateOne(
            { emp_id: req.body.emp_id, attendance_date: req.body.attendance_date },
            {
                $set: {
                    final_verify_status: 1,
                }
            }
        );

        out.message = "success"
        out.error = false
        out.data = data

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null

    } finally {
        //setting the output
        res.send(out)
    }
}

// Attendance Status (get)
export const getAttendanceStatusbyId = async (req, res) => {
    const out = {}
    try {
        if (!req.body.emp_id) throw new Error("Emp_id required")
        if (!req.body.attendance_date) throw new Error("Date In required!")

        out.message = "success"
        out.error = false
        out.data = await AttendanceStatus.findOne({ emp_id: req.body.emp_id, attendance_date: req.body.attendance_date })

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null

    } finally {
        //setting the output
        res.send(out)
    }
}

export function getRemark(checkin) {
    return (moment(checkin, 'LTS').isBefore(moment('10:01:00AM', 'LTS'))) ? 'On Time' : 'Late'
}

function getformattedDate(stringDate) {
    const date = stringDate ? new Date(Date.parse(stringDate)) : new Date()
    const month = ((date.getMonth() + 1) < 10) ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
    return Date.parse(date.getFullYear() + "-" + (month) + "-" + (date.getDate()))
}

export const signInRegister = async (req, res) => {
    const out = {}
    try {
        if (!req.body.emp_id) throw new Error("Emp_id required")
        if (!req.body.in_time) throw new Error("time In required!")

        const emp_check = await Employee.find({ emp_id: req.body.emp_id }).countDocuments()

        if (emp_check == 0)
            throw Error("Invalid emp_id")

        const date = moment(new Date()).format("YYYY-MM-DD")

        const attendance = new Attendance({
            emp_id: req.body.emp_id,
            empID: req.body.empID,
            in_time: req.body.in_time,
            site: req.body.site,
            distance_in: req.body.distance_in + " mtrs",
            date: date,
            timestamp: moment().format("LTS")
        })

        await attendance.save()
        out.message = "success"
        out.error = false
        out.data = attendance

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null

    } finally {
        //setting the output
        res.send(out)
    }
}

export const signOutRegister = async (req, res) => {
    const out = {}
    try {
        if (!req.body.emp_id) throw new Error("Emp_id required")
        if (!req.body.out_time) throw new Error("time In required!")
        if (!req.body.activity) throw new Error("Activity In required!")
        if (!req.body.date) throw new Error("Date In required!")

        const emp_check = await Attendance.findOne({ emp_id: req.body.emp_id, date: req.body.date, out_time: null })

        if (!emp_check)
            throw Error("Not registered the attendance!")

        const inTime = moment(emp_check.in_time, 'HH:mm:ss a');
        const outTime = moment(req.body.out_time, 'HH:mm:ss a');

        const duration = moment.duration(outTime.diff(inTime));

        const hours = parseInt(duration.asHours());
        const minutes = parseInt(duration.asMinutes()) % 60

        // console.log("After" + hours + ' hours and ' + minutes + ' minutes.');

        for (let i = 0; i < req.body.activity.length; i++) {
            console.log(req.body.activity[i].label);
            await Attendance.updateOne(
                { emp_id: emp_check.emp_id, out_time: null },
                {
                    $push: {
                        activity: req.body.activity[i].label
                    }
                }
            )
        }

        out.message = "success"
        out.error = false
        out.data = await Attendance.updateOne(
            { emp_id: emp_check.emp_id, out_time: null },
            {
                $set: {
                    emp_id: req.body.emp_id,
                    out_time: req.body.out_time,
                    distance_out: req.body.distance_out + " mtrs",
                    total_time: hours + ' hours and ' + minutes + ' minutes'
                }
            }
        );

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null

    } finally {
        //setting the output
        res.send(out)
    }
}


export const getAttendanceID = async (req, res) => {
    const out = {}
    try {
        if (!req.body.emp_id) throw new Error("Emp_id required")
        if (!req.body.date) throw new Error("Date In required!")

        const data = await Attendance.find({ emp_id: req.body.emp_id, date: req.body.date }).sort({ in_time: -1 })
        const attendanceStatus = await AttendanceStatus.findOne({ emp_id: req.body.emp_id, attendance_date: req.body.date })


        if (!data)
            throw Error("No records!")

        out.message = "success"
        out.error = false
        out.data = data
        out.attendanceData = attendanceStatus

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null
        out.attendanceData = null
        out.total_Time = null

    } finally {
        //setting the output
        res.send(out)
    }
}

//for particular user in Mobile phone
export const getAttendance = async (req, res) => {
    const out = {}
    try {
        if (!req.body.emp_id) throw new Error("Emp_id required")
        if (!req.body.date) throw new Error("Date In required!")

        const data = await Attendance.find({ emp_id: req.body.emp_id, date: req.body.date }).sort({ in_time: -1 })
        const attendanceStatus = await AttendanceStatus.findOne({ emp_id: req.body.emp_id, attendance_date: req.body.date })

        let hr = []
        let min = []
        let hTime = ""
        let mTime = ""
        for (let i = 0; i < data.length; i++) {
            if (data[i].total_time != null) {
                hTime = data[i].total_time.split(" ")[0]
                mTime = data[i].total_time.split(" ")[3]
            } else {
                hTime = 0
                mTime = 0
            }
            hr.push(hTime)
            min.push(mTime)
        }
        let totalHrs = hr.reduce((a, b) => parseInt(a) + parseInt(b), 0);
        let totalMins = min.reduce((a, b) => parseInt(a) + parseInt(b), 0);

        while (totalMins >= 60) {
            totalHrs += 1
            totalMins -= 60
        }


        if (!data)
            throw Error("No records!")

        out.message = "success"
        out.error = false
        out.data = data
        out.attendanceData = attendanceStatus
        out.total_Time = totalHrs + "hrs " + totalMins + "mins"

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null
        out.attendanceData = null
        out.total_Time = null

    } finally {
        //setting the output
        res.send(out)
    }
}

//get Notification User Mobile
export const getNotification = async (req, res) => {
    const out = {}
    try {
        if (!req.body._id) throw new Error("Emp_id required")

        const data = await VerifyActivity.find({ emp_id: req.body._id, status: 0 })
            .populate({ path: "admin_id", select: ['name'] })
            .sort({ date: -1 })

        if (!data)
            throw Error("No records!")

        out.message = "success"
        out.error = false
        out.data = data

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null

    } finally {
        //setting the output
        res.send(out)
    }
}

//User response
export const deleteNotification = async (req, res) => {
    const out = {}
    try {
        if (!req.body._id) throw new Error("Emp_id required")
        if (!req.body.attendance_date) throw new Error("Attendance  required")

        const data = await VerifyActivity.findOne({ emp_id: req.body._id, attendance_date: req.body.attendance_date, status: 0 })
        const emp_check = await Employee.findOne({ _id: req.body._id })

        if (!data)
            throw Error("No records!")

        // if (req.body.agree_disagree_status === 1) { //agree, 
        //verifyActivity status = 1 || AttendanceStatus === 1
        await VerifyActivity.updateOne(
            { emp_id: req.body._id, attendance_date: req.body.attendance_date, status: 0 },
            {
                $set: {
                    emp_response: req.body.emp_response,
                    status: 1,
                }
            })
        await AttendanceStatus.updateOne(
            { emp_id: emp_check.emp_id, attendance_date: req.body.attendance_date, },
            {
                $set: {
                    response_status: 1,
                }
            })

        // }
        // if (req.body.agree_disagree_status === 2) { //disagree || then goes to admin panel for final present and absent
        //     await VerifyActivity.updateOne(
        //         { _id: data._id },
        //         {
        //             $set: {
        //                 emp_response: req.body.emp_response,
        //                 status: 1 //user read it
        //             }
        //         })
        // }

        out.message = "success"
        out.error = false
        out.data = "DONE"

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null

    } finally {
        //setting the output
        res.send(out)
    }
}

// test for attendance Not in use
// Attendance User (Admin)
export const attendanceByDate = async (req, res) => {
    const out = {}
    try {
        if (!req.body.date) throw new Error("Date In required!")
        const datas = await Attendance.distinct("emp_id", { date: req.body.date })

        if (!datas)
            throw Error("No records!")

        let hr = []
        let min = []
        let data = []
        let hTime = ""
        let mTime = ""
        for (const index in datas) {
            const result = await Attendance.findOne({ emp_id: datas[index], date: req.body.date })
                .populate({ path: "empID", select: ['name', 'email', 'phone', "_id"] })
            let attendanceStatus = await AttendanceStatus.findOne({ emp_id: datas[index], attendance_date: req.body.date })

            if (!attendanceStatus) attendanceStatus = null

            const attData = await Attendance.find({ emp_id: datas[index], date: req.body.date }, ["in_time", "out_time", "total_time"])

            for (let i = 0; i < attData.length; i++) {

                if (attData[i].total_time != null) {
                    hTime = attData[i].total_time.split(" ")[0]
                    mTime = attData[i].total_time.split(" ")[3]
                } else {
                    hTime = 0
                    mTime = 0
                }
                hr.push(hTime)
                min.push(mTime)
            }
            let totalHrs = hr.reduce((a, b) => parseInt(a) + parseInt(b), 0);
            let totalMins = min.reduce((a, b) => parseInt(a) + parseInt(b), 0);

            while (totalMins >= 60) {
                totalHrs += 1
                totalMins -= 60
            }
            const totalTime = totalHrs + " hrs  " + totalMins + " mins"

            // data.push({ ...result._doc, totalTime: totalHrs + ' hour and ' + totalMins + ' minutes.' })
            data.push({ ...result._doc, totalTime: totalTime, attendanceStatus: attendanceStatus })
            // data.push({ totalTime: totalHrs + ' hour and ' + totalMins + ' minutes.' })
        }

        out.message = "success"
        out.error = false
        out.data = data

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null

    } finally {
        //setting the output
        res.send(out)
    }
}

// Attendance User (Admin)
// export const attendanceByDate = async (req, res) => {
//     const out = {}
//     try {
//         if (!req.body.date) throw new Error("Date In required!")

//         const datas = await Attendance.distinct("emp_id", { date: req.body.date })

//         if (!datas)
//             throw Error("No records!")


//         let hr = []
//         let min = []
//         let data = []
//         for (const index in datas) {
//             const result = await Employee.findOne({ emp_id: datas[index] })
//             const attendanceStatus = await AttendanceStatus.findOne({ emp_id: datas[index], attendance_date: req.body.date })

//             const attData = await Attendance.find({ emp_id: datas[index], date: req.body.date }, ["in_time", "out_time"])
//             for (let i = 0; i < attData.length; i++) {

//                 const startTime = moment(attData[i].in_time, 'HH:mm:ss a');
//                 const endTime = moment(attData[i].out_time, 'HH:mm:ss a');

//                 const duration = moment.duration(endTime.diff(startTime));

//                 const hours = parseInt(duration.asHours());
//                 const minutes = parseInt(duration.asMinutes()) % 60;
//                 hr.push(hours)
//                 min.push(minutes)
//             }
//             let totalHrs = hr.reduce((a, b) => a + b, 0);
//             let totalMins = min.reduce((a, b) => a + b, 0);

//             while (totalMins >= 60) {
//                 totalHrs += 1
//                 totalMins -= 60
//             }

//             // data.push({ ...result._doc, totalTime: totalHrs + ' hour and ' + totalMins + ' minutes.' })
//             data.push({ ...result._doc, totalhr: totalHrs, totalMn: totalMins, attendanceStatus: attendanceStatus })
//             // data.push({ totalTime: totalHrs + ' hour and ' + totalMins + ' minutes.' })
//         }

//         out.message = "success"
//         out.error = false
//         out.data = data

//     } catch (err) {
//         out.message = err.message
//         out.error = true
//         out.data = null

//     } finally {
//         //setting the output
//         res.send(out)
//     }
// }

// Attendance User (Admin) // all attendance for a particular day 
export const getAttendanceByDateAndId = async (req, res) => {
    const out = {}
    try {
        if (!req.body.emp_id) throw new Error("emp_id In required!")
        if (!req.body.date) throw new Error("Date In required!")

        const data = await Attendance.find({ emp_id: req.body.emp_id, date: req.body.date })

        if (!data)
            throw Error("No records!")

        out.message = "success"
        out.error = false
        out.data = data

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null

    } finally {
        //setting the output
        res.send(out)
    }
}

//Verify Activity by Admin
export const verifyActivities = async (req, res) => {
    const out = {}
    try {

        if (!req.body.emp_id) throw Error("Emp ID Id provided!")
        if (!req.body.admin_id) throw Error("No Admin Id provided!")
        if (!req.body.message) throw Error("Message is not provided!")

        if (!req.body.response_status) throw new Error("Status In required!")
        if (!req.body.attendance_date) throw new Error("Date In required!")


        const chekIfAreadyResponded = await VerifyActivity.findOne({ emp_id: req.body.emp_id, attendance_date: req.body.attendance_date })
        if (chekIfAreadyResponded)
            throw Error("Already Responded")

        const date = moment(new Date()).format("YYYY-MM-DD")

        const empCheck = await Employee.findOne({ _id: req.body.emp_id })


        const verify = new VerifyActivity({
            emp_id: empCheck._id,
            admin_id: req.body.admin_id,
            attendance_date: req.body.attendance_date,
            message: req.body.message,
            date: date
        })
        await verify.save()

        const data = new AttendanceStatus({
            emp_id: empCheck.emp_id,
            attendance_date: req.body.attendance_date,
            is_admin_responded: 1,
            response_status: req.body.response_status,
        })
        await data.save()


        out.message = "success"
        out.error = false
        out.data = verify
    } catch (error) {
        out.message = error.message
        out.error = true
        out.data = null
    } finally {
        res.send(out)
    }
}

//get verified activity according to adimn
export const getVerifiedActivity = async (req, res) => {
    const out = {}
    try {

        if (!req.body.admin_id) throw Error("No Admin Id provided!")

        const data = await VerifyActivity.find({ admin_id: req.body.admin_id })
            .populate({ path: "emp_id", select: ['name', 'email', 'phone', 'emp_id'] })
            // .populate({ path: "attendance_id", select: ['date', 'activity'] })
            .sort({ date: -1 })

        out.message = "success"
        out.error = false
        out.data = data
    } catch (error) {
        out.message = error.message
        out.error = true
        out.data = null
    } finally {
        res.send(out)
    }
}

//get the total time in a day that the user work for
export const getTotalTime = async (req, res) => {
    const out = {}
    try {

        if (!req.body.emp_id) throw new Error("emp_id In required!")
        if (!req.body.date) throw new Error("Date In required!")

        const data = await Attendance.find({ emp_id: req.body.emp_id, date: req.body.date, }, ["in_time", "out_time"])

        let hr = []
        let min = []
        for (let i = 0; i < data.length; i++) {

            const startTime = moment(data[i].in_time, 'HH:mm:ss a');
            const endTime = moment(data[i].out_time, 'HH:mm:ss a');

            const duration = moment.duration(endTime.diff(startTime));

            const hours = parseInt(duration.asHours());
            const minutes = parseInt(duration.asMinutes()) % 60;
            hr.push(hours)
            min.push(minutes)
        }

        let totalHrs = hr.reduce((a, b) => a + b, 0);
        let totalMins = min.reduce((a, b) => a + b, 0);

        while (totalMins >= 60) {
            totalHrs += 1
            totalMins -= 60
        }

        // console.log("After" + totalHrs + ' hour and ' + totalMins + ' minutes.');

        if (!data)
            throw Error("No records!")

        out.message = "success"
        out.error = false
        out.data = totalHrs + ' hour and ' + totalMins + ' minutes.'
    } catch (error) {
        out.message = error.message
        out.error = true
        out.data = null
    } finally {
        res.send(out)
    }
}

export function getAttendanceStatus(status) {
    return status === 0 ? 'Present' : 'Absent'
}
export const getAttendanceByMonth = async (req, res) => {
    const date = new Date(req.body.date)
    const month = (date.getMonth() + 1) <= 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
    const year = date.getFullYear()
    const total_days = moment(year + "-" + month, "YYYY-MM").daysInMonth()

    let start_date = ""
    for (let i = 1; i <= total_days; i++) {
        if (i === total_days) start_date = start_date + "" + year + "-" + month + '-' + ((i <= 9) ? ("0" + i) : i) + ""
        else start_date = start_date + "" + year + "-" + month + '-' + ((i <= 9) ? ("0" + i) : i) + " "
    }
    start_date = start_date.split(' ');

    let employees = []
    let emp = { "performance": [] }

    const results = await Employee.find({})
    for (let i = 0; i < results.length; i++) {
        emp = { ...results[i]._doc }

        let arr = []
        for (let j = 0; j < total_days; j++) {
            const attendanceStatus = await AttendanceStatus.findOne({
                $and:
                    [
                        { emp_id: results[i].emp_id },
                        { attendance_date: start_date[j] }
                    ]
            })
            // console.log(i, j);
            arr[j] = { "id": j, "dates": start_date[j], 'att': attendanceStatus ? attendanceStatus.response_status === 0 ? 'Present' : 'Absent' : 'Not Marked' }
        }
        emp.performance = arr
        employees.push(emp)
    }
    res.send(employees)
}

// range function
export function getDatesInRange(startDate, endDate) {
    const date = new Date(startDate.getTime());

    const dates = [];

    while (date <= endDate) {
        dates.push(moment(new Date(date)).format("YYYY-MM-DD"));
        date.setDate(date.getDate() + 1);
    }

    return dates;
}
export const byRange = async (req, res) => {
    const d1 = new Date(req.body.start_date);
    const d2 = new Date(req.body.end_date);

    const start_date = getDatesInRange(d1, d2)

    let employees = []
    let emp = { "performance": [] }

    const results = await Employee.find({})
    for (let i = 0; i < results.length; i++) {
        emp = { ...results[i]._doc }
        let arr = []
        for (let j = 0; j < start_date.length; j++) {
            const attendanceStatus = await AttendanceStatus.findOne({
                $and:
                    [
                        { emp_id: results[i].emp_id },
                        { attendance_date: start_date[j] }
                    ]
            })
            arr[j] = { "id": j, "dates": start_date[j], 'att': attendanceStatus ? getAttendanceStatus(attendanceStatus.response_status) : 'Not Marked' }
        }
        emp.performance = arr
        employees.push(emp)
    }
    res.send(employees)
}


// Not in use
export const getEmpNAttendance = async (req, res) => {
    const out = {}
    try {
        const attendanceType = req.body.attendance_type

        const query = req.body.query
        const conditions = []
        if (query) {
            conditions.push({
                name: {
                    $regex: query,
                    $options: "i",
                }
            })
        }

        conditions.push({ status: { $in: (req.body.status ? [req.body.status] : [0, 3, 4]) } })

        const pageNumber = parseInt(req.body.current_page) || 1
        const total = await Employee.find({ $and: conditions }).countDocuments()
        const itemPerPage = (attendanceType) ? total : 10

        const results = await Employee.find({ $and: conditions }, ["emp_id", "name", "phone", "designation", "profile_img",])
            .sort({ name: "asc" })
            .skip(pageNumber > 1 ? (pageNumber - 1) * itemPerPage : 0)
            .limit(itemPerPage)

        const employees = []
        for (let i = 0; i < results.length; i++) {
            const emp = { ...results[i]._doc }

            const attendance = await Attendance.find({
                $and:
                    [
                        { emp_id: results[i].emp_id },
                        { date: getformattedDate(req.body.date) },
                    ]
            })

            emp.attendance = attendance
            for (let j = 0; j < attendance.length; j++) {
                const att = attendance[j];
                if (att.attendanceType == 1) {
                    emp.remark = getRemark(att.timestamp)
                    break
                }
            }


            switch (attendanceType ? attendanceType.toLowerCase() : 'xyz') {
                case 'present':
                    if (attendance !== null && attendance.length > 0)
                        employees.push(emp)
                    break
                case 'absent':
                    if (attendance === null || attendance.length == 0)
                        employees.push(emp)
                    break
                case 'late':
                    if (attendance != null && emp.remark === 'Late')
                        employees.push(emp)
                    break
                default:
                    employees.push(emp)
                    break
            }
            // console.log(attendance)
        }

        out.message = "success"
        out.error = false
        out.current_page = pageNumber
        out.item_perpage = itemPerPage
        out.total_page = Math.ceil(total / itemPerPage)
        out.total_items = attendanceType ? employees.length : total
        out.data = employees

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null

    } finally {
        //setting the output
        res.send(out)
    }
}




export const fillForTest = async (req, res) => {
    for (var i = 25; i < 31; i++) {
        const emp_id = "GT/0002/22"
        const date = "2022-04-" + ((i < 9) ? ("0" + i) : i)
        // console.log(date)
        const attendance = new Attendance({
            emp_id: emp_id,
            attendanceType: 1,
            date: date,
            timestamp: '11:00:00 AM'
        })

        await attendance.save()
    }

    res.send("done")
}