import express from "express";
import {
  userlogins,
  createuser,
  getuser,
  getallUsers,
  deleteuser,
  updateuser,
  getuserbyusername,
  getUsersByUsernameA,
  countUsers,
  getUsersWithPagination,
  getUsersWithSorting,
  getUsersNotLoggedInSince,
  logUserActivity,
  getActiveUsers,
  getInactiveActiveUsers
} from "../Controllers/AuthCtrl.js";

const router = express.Router();
router.post("/login",userlogins);
router.post("/user", createuser);
router.get("/users", getallUsers);
router.get("/user/:id", getuser);
router.get("/username/:username", getuserbyusername);
router.put("/user/:id", updateuser);
router.delete("/user/:id", deleteuser);
router.get("/usersa/a", getUsersByUsernameA);
router.get("/userc/count", countUsers);
router.get("/userp/pagination", getUsersWithPagination);
router.get("/usersorting/sorting",getUsersWithSorting);
router.get("/usernotlog/notLoggedInSince",getUsersNotLoggedInSince);
router.post("/useractivities/logUserActivity", logUserActivity); 
router.get("/ ", getActiveUsers)
router.get("/userinactive/Inactiveuser", getInactiveActiveUsers)


export default router;
