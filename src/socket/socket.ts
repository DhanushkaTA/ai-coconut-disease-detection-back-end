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

let io: Server;

export const initSocket = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            credentials: true
        }
    });

    io.use(async (socket, next) => {
        try {
            // const token = socket.handshake.auth?.token;
            const cookieHeader = socket.handshake.headers.cookie;

            if (!cookieHeader) {
                return next(new Error("No cookies sent"));
            }

            const cookies = cookie.parse(cookieHeader);
            const token = cookies.access_token;

            if (!token) {
                return next(new AppError("Authentication error", 401));
            }

            const decoded: any = jwt.verify(token, JWT_SECRET);

            const user =
                await UserModel.findById(decoded.userId,undefined,undefined);

            if (!user) {
                return next(new AppError("User not found", 401));
            }

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

        // user join to user room
        socket.join(socket.data.user._id.toString());

        chatSocketHandler(socket);

        // user register to each chat room
        //userId_1 --> sender
        //userId_2 --> receiver
        socket.on('register_room', async ({userId_1, userId_2}) => {

            try {
                // Store or update the client ID and socket ID
                // await ChatService.storeWhenConnectClientData(userEmail, socket.id)

                // create or get a chat room for each conversation
                let chat: IChat = await ChatController.getOrCreateChat(userId_1, userId_2);

                console.log(`Select chat room for user: ${userId_1}, ${userId_2} conversation and Socket ID: ${socket.id}`);

                //----------------------------------------------

                // Create a room for each client and admin
                const roomId = `room_${chat._id.toString()}`;

                console.log("user room is : "+roomId)

                // await ChatService.storeChatRoomDetails(userEmail, roomId)

                // Each client joins their own room
                socket.join(roomId);

                //send room id to connected user
                io.to(socket.id).emit('room_id',roomId);


            } catch (err) {
                console.error('💥  Error updating client data:', err);
            }
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

    socket.on("send_message", async ({ senderId, receiverId, content }) => {

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
    });

}
