import { Router } from "express";
import { login, register, logout } from "../controller/user.controller";
import {verifyToken} from "../middleware/VerifyToken";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);

export default router;
