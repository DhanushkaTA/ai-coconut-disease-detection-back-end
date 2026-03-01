import { Router } from "express";
import {
    createPost,
    deletePost,
    getAllPosts,
    getPostById,
    togglePostLike
} from "../controller/post.controller";
import {protect} from "../middleware/verify.token";
// import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/",
    protect,
    createPost);
router.get("/",
    protect,
    getAllPosts);
router.get("/:id",
    protect,
    getPostById);
router.delete("/:id",
    protect,
    deletePost);
router.post("/:id/like",
    protect,
    togglePostLike);

export default router;
