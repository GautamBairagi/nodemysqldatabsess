import express from "express";
import {
  createuser,
  getuser,
  getallUsers,
  deleteuser,
  updateuser,
} from "../Controllers/AuthCtrl.js";

const router = express.Router();

router.post("/user", createuser);
router.get("/users", getallUsers);
router.get("/user/:id", getuser);
router.put("/user/:id", updateuser);
router.delete("/user/:id", deleteuser);

export default router;
