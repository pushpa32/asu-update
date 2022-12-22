import express from "express";
import {
  getUser,
  getUsers,
  registerNewUser,
  getLatestFiveUser,
  getPersonalDetail,
  searchUser,
  deleteUser,
  updateProfileImage,
  getSingleUserDetail,
  updateAdminPersonalDetail,
  updateAdminPassword,
  filterList
} from "../controller/user.js";
import { verifyAdmin, verifySuperAdmin, verifyUser } from "../utils/verifyToken.js";


export const user = express.Router();

//detail of user
user.post("/get", verifyUser, getUser);
user.post("/get/all", getUsers);

// ADMIN
user.post("/get/user", getSingleUserDetail);
user.post("/register", verifyAdmin, registerNewUser);
user.post("/new/user/list", verifyAdmin, getLatestFiveUser);
user.post("/get/personal/info", verifyAdmin, getPersonalDetail);
user.post("/update/admin/details", verifyAdmin, updateAdminPersonalDetail);
user.post("/update/password", verifyAdmin, updateAdminPassword);


//search by name
user.post("/search", searchUser);

//remove user
user.post("/delete", deleteUser);

// Filter the user Search
user.post("/filter", filterList);

//Update Profile Image
user.post("/update", updateProfileImage);

//404
user.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});
