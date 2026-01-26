import { Router } from "express";
import {
    createAlert,
    getAllAlerts,
    getAlertById,
    updateAlert,
    deleteAlert,
    toggleLike
} from "../controller/alert.controller";
// import { protect } from "../middleware/auth.middleware";
// import { restrictTo } from "../middleware/role.middleware";

const router = Router();

router.get("/",
    // protect,
    getAllAlerts);
router.get("/:id",
    // protect,
    getAlertById);

// Admin / Moderator only
router.post("/",
    // protect, restrictTo("admin", "moderator"),
    createAlert);
router.put("/:id",
    // protect, restrictTo("admin", "moderator"),
    updateAlert);
router.delete("/:id",
    // protect, restrictTo("admin", "moderator"),
    deleteAlert);

// Likes (any logged-in user)
router.post("/:id/like",
    // protect,
    toggleLike);

export default router;
