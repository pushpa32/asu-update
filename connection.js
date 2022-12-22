import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const CON = process.env.MONGO_URI
// const CON = "mongodb://127.0.0.1:27017/asu"

mongoose.connect(CON, { useNewUrlParser: true, useUnifiedTopology: true })

export const connection = mongoose.connection