import moment from 'moment'
import mongoose, { Schema } from 'mongoose'

const attendanceSchema = new mongoose.Schema
    (
        {
            emp_id: { type: String, required: true },
            empID: { type: Schema.Types.ObjectId, ref: 'Employee' },
            in_time: { type: String, required: true },
            out_time: { type: String, default: null },
            site: { type: String, require: true },
            distance_in: { type: String, require: true },
            distance_out: { type: String, default: null },
            activity: { type: Array, default: [] },
            // is_admin_responded: { type: Number, default: 0 }, //0-not responded to this activity, 1- responded by admin
            date: { type: String, required: true },
            total_time: { type: String, default: null },
            timestamp: { type: String, default: (moment().format("LTS")) }
        }
    )

// attendanceSchema.set('timestamps', true); 

export const Attendance = mongoose.model("Attendance", attendanceSchema)