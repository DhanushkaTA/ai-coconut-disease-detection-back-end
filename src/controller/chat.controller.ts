// services/chat.service.ts
import ChatModel from "../model/chat/chat.model";
import { Types } from "mongoose";

export const getOrCreateChat = async (
    user1: Types.ObjectId,
    user2: Types.ObjectId
) => {
    let chat = await ChatModel.findOne({
        participants: { $all: [user1, user2] }
    });

    if (!chat) {
        chat = await ChatModel.create({
            participants: [user1, user2]
        });
    }

    return chat;
};
