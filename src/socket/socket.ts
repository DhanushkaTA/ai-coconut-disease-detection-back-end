import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import UserModel from "../model/user.model";
import {AppError} from "../util/AppError";
import cookie from "cookie";
import * as ChatController from '../controller/chat.controller'
import {IChat} from "../type/schema.type";
import { Socket } from 'socket.io';
import {getOrCreateChat} from "../controller/chat.controller";
import MessageModel from "../model/chat/message.model";
import { log } from "console";

let io: Server;

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            // origin: "*",
            origin: ["http://localhost:5173","http://localhost:5174", "http://localhost:5175"],
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            console.log("Socket authentication middleware triggered");
            // const token = socket.handshake.auth?.token;
            const cookieHeader = socket.handshake.headers.cookie;

             
            if (!cookieHeader) {
                return next(new Error("No cookies sent"));
            }

            console.log("Authenticated user 38:", cookieHeader);

            let data = cookieHeader.split('_token=');

            console.log("Authenticated cookies:", data[1]);


            // const cookies = cookie.parse(cookieHeader);
            //  console.log("Authenticated cookies:", cookies);
            // const token = cookies.access_token;
            const token = data[1];

            console.log("Authenticated token:", token);

            if (!token) {
                return next(new AppError("Authentication error", 401));
            }

            const decoded: any = jwt.verify(token, JWT_SECRET);

            console.log("Authenticated decoded:", decoded);

            const user =
                await UserModel.findById(decoded._id,undefined,undefined);

            if (!user) {
                return next(new AppError("User not found", 401));
            }

            console.log("Authenticated user:", user.email);

            socket.data.user = user;
            next();
        } catch (err) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(
            `🟢 User connected: ${socket.data.user.email}`
        );
         console.log(
            `🟢 User connected: ${socket.data.user._id}`
        );

        // user join to user room
        socket.join(socket.data.user._id.toString());

        chatSocketHandler(socket);

        // user register to each chat room
        //userId_1 --> sender
        //userId_2 --> receiver
        // socket.on('register_room', async ({userId_1, userId_2}) => {

        //     try {
        //         // Store or update the client ID and socket ID
        //         // await ChatService.storeWhenConnectClientData(userEmail, socket.id)

        //         // create or get a chat room for each conversation
        //         let chat: IChat = await ChatController.getOrCreateChat(userId_1, userId_2);

        //         console.log(`Select chat room for user: ${userId_1}, ${userId_2} conversation and Socket ID: ${socket.id}`);

        //         //----------------------------------------------

        //         // Create a room for each client and admin
        //         const roomId = `room_${chat._id.toString()}`;

        //         console.log("user room is : "+roomId)

        //         // await ChatService.storeChatRoomDetails(userEmail, roomId)

        //         // Each client joins their own room
        //         socket.join(roomId);

        //         //send room id to connected user
        //         io.to(socket.id).emit('room_id',roomId);


        //     } catch (err) {
        //         console.error('💥  Error updating client data:', err);
        //     }
        // });

        socket.on("register_room", async ({ chatId }) => {

            const roomId = `room_${chatId}`;

            socket.join(roomId);

            console.log("Joined room:", roomId);
        });


        socket.on("disconnect", () => {
            console.log(
                `🔴 User disconnected: ${socket.data.user.email}`
            );
        });
    });

    // io.on("connection", socket => {
    //     socket.join(socket.userId);
    // });


    return io;
};

export const getIO = () => {
    if (!io) {
        throw new AppError("Socket.io not initialized", 500);
    }
    return io;
};

const chatSocketHandler = (socket: Socket) => {

    socket.on("send_message", async ({ 
        // senderId, 
            receiverId,
            content, 
            image,
            clientTempId
         }) => {

        /**
         * 
        const chat: IChat = await getOrCreateChat(
            // socket.userId,
            senderId,
            receiverId
        );

        // save msg details
        const message = await MessageModel.create({
            chatId: chat._id,
            // senderId: socket.userId,
            senderId: senderId,
            receiverId,
            content
        });

        chat.lastMessage = message._id;
        await chat.save();

        // emit to receiver
        io.to(receiverId).emit("receive_message_notification", message);

        io.to(`room_${chat._id.toString()}`).emit("receive_message", message);

        // emit to sender (using this, we can verify msg is sent)
        socket.emit("receive_message", message);

        */

         const senderId = socket.data.user._id;

        console.log("Received message:", { senderId, receiverId, content, image });
        

        const chat = await ChatController.getOrCreateChat(senderId, receiverId);

        const message = await MessageModel.create({
            chatId: chat._id,
            senderId,
            receiverId,
            content,
            image,
        });

        chat.lastMessage = message._id;
        chat.updatedAt = new Date();
        await chat.save();

        // 🔔 Notify receiver (for unread badge)
        io.to(receiverId).emit("receive_message_notification", message);

        // 💬 Emit to chat room
        // io.to(`room_${chat._id}`).emit("receive_message", message);
        io.to(`room_${chat._id}`).emit("receive_message", {
            ...message.toObject(),
            clientTempId, // 👈 send it back
        });
    });

    // Read Receipt Socket
    socket.on("mark_read", async ({ chatId }) => {

        const userId = socket.data.user._id;

        await MessageModel.updateMany(
            {
                chatId,
                receiverId: userId,
                isRead: false,
            },
            { isRead: true }
        );

        io.to(`room_${chatId}`).emit("messages_read", {
            chatId,
            readerId: userId,
        });
    });

}
