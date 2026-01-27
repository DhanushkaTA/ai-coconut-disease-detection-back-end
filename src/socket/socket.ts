import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import UserModel from "../model/user.model";
import {AppError} from "../util/AppError";
import cookie from "cookie";

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

        socket.on("disconnect", () => {
            console.log(
                `🔴 User disconnected: ${socket.data.user.email}`
            );
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new AppError("Socket.io not initialized", 500);
    }
    return io;
};
