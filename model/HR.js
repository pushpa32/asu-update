import mongoose from 'mongoose'

const hrSchema = new mongoose.Schema
    (
        {
            hr_id: { type: String, required: true },
            email: { type: String, required: true },
            password: { type: String, required: true },
            name: { type: String, required: true },
            phone: { type: String, required: true, default: "NA" },
            dob: { type: String, required: true, default: "NA" },
            isHR: { type: Boolean, default: true },
            isAdmin: { type: Boolean, default: false },
            isSuperAdmin: { type: Boolean, default: false },
            isUser: { type: Boolean, default: false }
        }
    )
hrSchema.index({ admin_id: 1, email: 1 }, { unique: true, unique: true })

export const HR = mongoose.model("HR", hrSchema)