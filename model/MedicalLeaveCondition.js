import mongoose from 'mongoose'

const medicalLeaveConditionSchema = new mongoose.Schema
    (
        {
            updated_by: { type: String, required: [true, "emp_id of updater is required"] },
            yearly: { type: Number, default: 15, required: true },
            monthly: { type: Number, required: true },
        }
    )

export const MedicalLeaveCondition = mongoose.model("MedicalLeaveCondition", medicalLeaveConditionSchema)