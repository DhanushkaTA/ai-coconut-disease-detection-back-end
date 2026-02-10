import { Router } from "express";
import {
    addComment,
    getCommentsByAlert,
    updateComment,
    deleteComment
} from "../controller/alert.comment.controller";
import {protect} from "../middleware/verify.token";
// import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/:alertId",
    protect,
    addComment);
router.get("/:alertId",
    protect,
    getCommentsByAlert);
router.put("/:commentId",
    protect,
    updateComment);
router.delete("/:commentId",
    protect,
    deleteComment);

export default router;
