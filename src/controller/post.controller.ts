import { Request, Response, NextFunction } from "express";
import PostModel from "../model/post.model";
import { CustomResponse } from "../util/CustomResponse";
import { AppError } from "../util/AppError";
import { getIO } from "../socket/socket";


export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { content, image } = req.body;

        const post = await PostModel.create({
            content,
            image,
            createdBy: req.user!._id
        });

        // 🔔 Real-time alert to all users
        // getIO().emit("new-post", post);

        res.status(201).json(
            new CustomResponse(201, "Post created", post)
        );
    } catch (err) {
        next(err);
    }
};