import { Request, Response, NextFunction } from "express";
import PostModel from "../model/post.model";
import { CustomResponse } from "../util/CustomResponse";
import { AppError } from "../util/AppError";
import { getIO } from "../socket/socket";
import {IPost} from "../type/schema.type";


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

export const getAllPosts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await PostModel.find()
            .populate("createdBy", "firstName lastName profilePic")
            .sort({ createdAt: -1 });

        res.json(new CustomResponse(200, "Posts fetched", posts));
    } catch (err) {
        next(err);
    }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const post = await PostModel.findById(req.params.id, undefined, undefined)
            .populate("createdBy", "firstName lastName profilePic");

        if (!post) {
            return next(new AppError("Post not found", 404));
        }

        res.json(new CustomResponse(200, "Post fetched", post));
    } catch (err) {
        next(err);
    }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const post: IPost = await PostModel.findById(req.params.id, undefined, undefined);

        if (!post) {
            return next(new AppError("Post not found", 404));
        }

        if (
            !post.createdBy.equals(req.user!._id) &&
            req.user!.role !== "admin"
        ) {
            return next(new AppError("Unauthorized", 403));
        }

        await post.deleteOne();

        res.json(new CustomResponse(200, "Post deleted"));
    } catch (err) {
        next(err);
    }
};