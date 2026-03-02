import { Router } from "express";
import {
    createAlert,
    getAllAlerts,
    getAlertById,
    updateAlert,
    deleteAlert,
    toggleLike, getLatestAlerts,
    getTodayAlerts
} from "../controller/alert.controller";
import {protect} from "../middleware/verify.token";
import {restrictTo} from "../middleware/role.verify";


const router = Router();

router.get("/",
    protect,
    getAllAlerts);

router.get("/latest",
    protect,
    getLatestAlerts);

router.get("/today",
     protect, 
     getTodayAlerts);

// Likes (any logged-in user)
router.post("/:id/like",
    protect,
    toggleLike);

router.get("/:id",
    protect,
    getAlertById);

// Admin / Moderator only
router.post("/",
    protect,
    restrictTo("admin"),
    createAlert);

router.put("/:id",
    protect, restrictTo("admin"),
    updateAlert);

router.delete("/:id",
    protect, restrictTo("admin"),
    deleteAlert);






export default router;
