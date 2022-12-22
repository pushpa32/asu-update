import { Attendance } from "../model/Attendance.js"
import { AttendanceStatus } from "../model/AttendanceStatus.js"
import { Employee } from "../model/Employee.js"
import { Leave } from "../model/Leave.js"
import { getRemark } from "./attendance.js"
import { getAvailableLeaves, getformattedDate } from "./leave.js"


//get dashboard details Using
export const getDashboardDetail = async (req, res) => {
    const out = {}
    try {
        if (!req.body.date) throw Error("Date is required")

        const totalUser = await Employee.find({}, ["_id"]).countDocuments()
        const totalAttendance = await Attendance.distinct("emp_id", { date: req.body.date })
        const totalactivity = await Attendance.find({ date: req.body.date, activity: { $ne: null } }).countDocuments()

        const attendancePercentage = ((totalAttendance.length / totalUser) * 100)

        let temp = []
        // const sevenDaysAttendance = await AttendanceStatus.distinct("attendance_date")
        const sevenDaysAttendance = await AttendanceStatus.aggregate(
            [{ $group: { _id: "$attendance_date" } }, { $limit: 7 }]
        );
        for (let i = sevenDaysAttendance.length - 1; i >= 0; i--) {
            const getStatus = await AttendanceStatus.distinct("emp_id", { attendance_date: sevenDaysAttendance[i] })
            temp.push({ "type": sevenDaysAttendance[i]._id, "value": getStatus.length })
        };


        out.message = "success"
        out.error = false
        out.user = totalUser
        out.attendance = totalAttendance.length
        out.sevenDaysAttendance = temp
        out.attendancePercentage = attendancePercentage.toFixed(0) / 100
        out.activity = totalactivity
    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null
    } finally {
        //setting the output
        res.send(out)
    }
}



export const getEmpDashboard = async (req, res) => {
    const out = {}
    try {
        const emp_id = req.body.emp_id

        if (!emp_id)
            throw Error("Employee id required!")

        const emp_check = await Employee.find({ emp_id: emp_id }).countDocuments()
        if (emp_check == 0)
            throw Error("Invalid emp_id")

        const date = new Date()

        //attendance
        const att = await Attendance.findOne({ $and: [{ emp_id: emp_id }, { attendanceType: 1 }, { date: getformattedDate(date) }] })
        const isAttendanceMarked = att ? true : false
        const attendanceRemark = att ? getRemark(att) : 'Absent'

        //payslip
        const month = date.getMonth()
        const year = date.getFullYear()

        if (!month || !year) throw new Error("Month or Year is missing!")

        //leavesremaining
        const availableLeave = await getAvailableLeaves(emp_id)

        out.message = "success"
        out.error = false
        out.data = {
            attendance_marked: isAttendanceMarked,
            attendance_remark: attendanceRemark,
            availableLeave: availableLeave
        }

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null

    } finally {
        //setting the output
        res.send(out)
    }
}

export const getAdminDashboad = async (req, res) => {
    const out = {}
    try {
        //total status:
        const total_active_emp = await Employee.find({ status: { $in: [0, 3, 4] } }, ["emp_id"]).countDocuments()
        const total_inactive_emp = await Employee.find({ status: { $in: [1, 2] } }, ["emp_id"]).countDocuments()

        //present
        const date = getformattedDate()
        const attendances = await Attendance.find({ $and: [{ date: date }, { attendanceType: 1 }] })
        const total_present = attendances.length
        //absent
        const total_absent = total_active_emp - total_present
        //late
        let total_late = 0
        attendances.forEach((att) => {
            if (getRemark(att) === "Late")
                total_late++
        })
        //pending leave
        const total_pending_leaves = await Leave.find({ status: 0 }).countDocuments()

        out.message = "success"
        out.error = false
        out.data = {
            active_emp: total_active_emp,
            inactive_emp: total_inactive_emp,
            present_emp: total_present,
            absent_emp: total_absent,
            late_emp: total_late,
            pending_leave_requests: total_pending_leaves,
        }

    } catch (err) {
        out.message = err.message
        out.error = true
        out.data = null

    } finally {
        //setting the output
        res.send(out)
    }
}
