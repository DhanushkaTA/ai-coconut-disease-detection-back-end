import { Router } from "express";
import {protect} from "../middleware/verify.token";
import { createChat, getChatMessages, getUserChats, markMessagesAsRead } from "../controller/chat.controller";
// import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/",
    protect,
    getUserChats);

router.patch("/:chatId/read",
    protect,
    markMessagesAsRead);

router.get("/:chatId/messages",
    protect,
    getChatMessages);

router.post("/",
    protect,
    createChat);

export default router;
