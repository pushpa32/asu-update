import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema
    (
        {
            emp_id: { type: String, required: true },
            email: { type: String, required: true },
            name: { type: String, required: true },
            phone: { type: String, required: true },
            jv_partner: { type: String, required: true, default: "NA" },
            expert_input: { type: String, required: true, default: "NA" },
            device_id: { type: String, default: null },
            dob: { type: String, default: "NA" },
            designation: { type: String, required: true, default: "NA" },
            department: { type: String, required: true, default: "NA" },
            profile_img: { type: String, default: null },
            isUser: { type: Boolean, default: true },
            isAdmin: { type: Boolean, default: false }
        }
    )
employeeSchema.index({ emp_id: 1, email: 1, phone: 1 }, { unique: true, unique: true, unique: true })

export const Employee = mongoose.model("Employee", employeeSchema)