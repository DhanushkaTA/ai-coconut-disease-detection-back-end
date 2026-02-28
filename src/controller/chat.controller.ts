// services/chat.service.ts
import { Request, Response, NextFunction } from "express";
import ChatModel from "../model/chat/chat.model";
import { Types } from "mongoose";
import MessageModel from "model/chat/message.model";
import { CustomResponse } from "util/CustomResponse";

export const getOrCreateChat = async (user1: string, user2: string) => {

  // Always sort IDs to avoid duplicates
  const users = [user1, user2].sort();

  let chat = await ChatModel.findOne({
    participants: { $all: users },
  });

  if (!chat) {
    chat = await ChatModel.create({
      participants: users,
    });
  }

  return chat;
};

export const getUserChats = async (req: any, res:Response, next:NextFunction) => {

    try{
        const userId = req.user._id;

        const chats = await ChatModel.find({
            participants: userId,
        })
            .populate("participants", "username firstName lastName profilePic")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        const chatsWithUnread = await Promise.all(
            chats.map(async (chat) => {

            const unreadCount = await MessageModel.countDocuments({
                chatId: chat._id,
                receiverId: userId,
                isRead: false,
            });

            return {
                ...chat.toObject(),
                unreadCount,
            };
            })
        );

        // res.json(chatsWithUnread);
        res.status(200).json(
                    new CustomResponse(201, "Get chats", chatsWithUnread)
                );
    } catch (err) {
        next(err);
    }
  
};

export const getChatMessages = async (req: any, res:Response, next:NextFunction) => {
    try{
        const { chatId } = req.params;

        const messages = await MessageModel.find({ chatId })
            .sort({ createdAt: 1 });

        // res.json(messages);
        res.status(200).json(
                    new CustomResponse(201, "Get messages", messages)
                );
    } catch (err) {
        next(err);
    }
  
};

export const markMessagesAsRead = async (req: any, res:Response, next:NextFunction) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        await MessageModel.updateMany(
            {
                chatId,
                receiverId: userId,
                isRead: false,
            },
            {
                isRead: true,
            }
        );

        // res.json({ success: true });
        res.status(200).json(
                    new CustomResponse(201, "Mark messages as read", { success: true })
                );
    } catch (err) {
        next(err);
    }
  
};