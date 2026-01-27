import { Request, Response, NextFunction } from "express";
import {CustomResponse} from "../util/CustomResponse";
import postCommentModel from "../model/post.comment.model";
import PostCommentSchema from "../model/post.comment.model";

export const addComment = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const { content, parentCommentId } = req.body;
        const { postId } = req.params;

        const comment = await postCommentModel.create({
            postId,
            userId: req.user!._id,
            content,
            parentCommentId: parentCommentId || null
        });

        res.status(201).json(
            new CustomResponse(201, "Comment added", comment)
        );
    } catch (err) {
        next(err);
    }
};


export const getCommentsByAlert = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { postId } = req.params;

        const comments = await PostCommentSchema.find({ postId })
            .populate("userId", "firstName lastName profilePic")
            .sort({ createdAt: 1 });

        // build nested structure
        const map = new Map<string, any>();
        const roots: any[] = [];

        comments.forEach((comment: any) => {
            map.set(comment._id.toString(), { ...comment.toObject(), replies: [] });
        });

        map.forEach((comment) => {
            if (comment.parentCommentId) {
                const parent = map.get(comment.parentCommentId.toString());
                if (parent) {
                    parent.replies.push(comment);
                }
            } else {
                roots.push(comment);
            }
        });

        res.json(
            new CustomResponse(200, "Comments fetched", roots)
        );
    } catch (err) {
        next(err);
    }
};