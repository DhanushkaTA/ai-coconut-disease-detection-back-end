import { Router } from "express";
import { login, register, logout } from "../controller/user.controller";
import {restrictTo} from "../middleware/role.verify";
import {protect} from "../middleware/verify.token";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, restrictTo('admin'), logout);

export default router;
