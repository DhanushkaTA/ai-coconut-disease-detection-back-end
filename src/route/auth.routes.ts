import { Router } from "express";
import { login, register, logout } from "../controller/user.controller";

const router = Router();

router.post("/register", register);
router.get("/login", login);
router.post("/logout", logout);

export default router;
