import mongoose from 'mongoose'

const superAdminAchema = new mongoose.Schema
    (
        {
            superadmin_id: { type: String, required: true },
            email: { type: String, required: true },
            password: { type: String, required: true },
            name: { type: String, required: true },
            phone: { type: String, required: true, default: "NA" },
            dob: { type: String, required: true, default: "NA" },
            isAdmin: { type: Boolean, default: false },
            isSuperAdmin: { type: Boolean, default: true },
            isHR: { type: Boolean, default: false },
            isUser: { type: Boolean, default: false }
        }
    )
superAdminAchema.index({ admin_id: 1, email: 1 }, { unique: true, unique: true })

export const SuperAdmin = mongoose.model("SuperAdmin", superAdminAchema)