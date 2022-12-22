import mongoose, { Schema } from 'mongoose'

const verifyActivity = new mongoose.Schema
    (
        {
            emp_id: { type: Schema.Types.ObjectId, ref: 'Employee' },
            admin_id: { type: Schema.Types.ObjectId, ref: 'Admin' },
            attendance_date: { type: String, required: true },
            message: { type: String, required: true },
            emp_response: { type: String, default: null },
            status: { type: Number, required: true, default: 0 }, //Not confirmed
            final_verify_status: { type: Number, default: 0 }, //Not confirmed, 1- confirmed (final present-absent)
            date: { type: String, required: true }
        }
    )

export const VerifyActivity = mongoose.model("VerifyActivity", verifyActivity)