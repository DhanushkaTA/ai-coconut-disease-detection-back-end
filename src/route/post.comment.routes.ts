import { Router } from "express";
import {
    addComment,
    getCommentsByAlert,
    getCommentsByAlertV2,
    // updateComment,
    // deleteComment
} from "../controller/post.comment.controller";
import {protect} from "../middleware/verify.token";
// import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/:postId",
    protect,
    addComment);

router.get("/:postId",
    protect,
    getCommentsByAlertV2);

// router.get("/:alertId",
//     protect,
//     getCommentsByAlert);
    
// router.put("/:commentId",
//     protect,
//     updateComment);

// router.delete("/:commentId",
//     protect,
//     deleteComment);

export default router;
