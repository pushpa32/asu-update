import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema
    (
        {
            admin_id: { type: String, required: true },
            email: { type: String, required: true },
            password: { type: String, required: true },
            name: { type: String, required: true },
            phone: { type: String, required: true, default: "NA" },
            dob: { type: String, required: true, default: "NA" },
            isAdmin: { type: Boolean, default: true },
            isSuperAdmin: { type: Boolean, default: false },
            isHR: { type: Boolean, default: false },
            isUser: { type: Boolean, default: false }
        }
    )
adminSchema.index({ admin_id: 1, email: 1 }, { unique: true, unique: true })

export const Admin = mongoose.model("Admin", adminSchema)