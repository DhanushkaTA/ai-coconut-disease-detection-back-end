import { Request, Response, NextFunction } from "express";
import PostModel from "../model/post.model";
import { CustomResponse } from "../util/CustomResponse";
import { AppError } from "../util/AppError";
import { getIO } from "../socket/socket";
import {ICommentWithReplies, IPost} from "../type/schema.type";
import postCommentModel from "../model/post.comment.model";


export const createPost = async (req: any, res: Response, next: NextFunction) => {
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

export const getAllPosts = async (req: any, res: Response, next: NextFunction) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || "";

        const skip = (page - 1) * limit;

        const matchStage = search
        ? {
            $match: {
                $or: [
                { content: { $regex: search, $options: "i" } },
                { "user.firstName": { $regex: search, $options: "i" } },
                { "user.lastName": { $regex: search, $options: "i" } },
                ],
            },
            }
        : null;

        const aggregationPipeline: any[] = [
        {
            $lookup: {
            from: "users", // collection name in MongoDB
            localField: "createdBy",
            foreignField: "_id",
            as: "user",
            },
        },
        {
            $unwind: "$user",
        },
        ];

        if (matchStage) aggregationPipeline.push(matchStage);

        aggregationPipeline.push(
        {
            $sort: { createdAt: -1 },
        },
        {
            $facet: {
            data: [
                { $skip: skip },
                { $limit: limit },
            ],
            totalCount: [
                { $count: "count" },
            ],
            },
        }
        );

        const result = await PostModel.aggregate(aggregationPipeline);

        const posts = result[0].data;
        const totalCount = result[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.json(
        new CustomResponse(
            200,
            "Posts fetched",
            posts,
            totalPages
        )
        );
    } catch (err) {
        next(err);
    }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const post = await PostModel.findById(id)
        .populate("createdBy", "firstName lastName profilePic")
        .lean();

        if (!post) {
        return res.status(404).json({ message: "Post not found" });
        }

        const comments = await postCommentModel.find({ postId: id })
        .populate("userId", "firstName lastName profilePic")
        .sort({ createdAt: 1 })
        .lean();

        // Build nested comment tree
        const commentMap: Record<string, ICommentWithReplies> = {};
        const rootComments: ICommentWithReplies[] = [];

        comments.forEach((comment: any) => {
            const commentWithReplies: ICommentWithReplies = {
                ...comment,
                replies: [],
            };

            commentMap[comment._id.toString()] = commentWithReplies;
        });

        Object.values(commentMap).forEach((comment) => {
            if (comment.parentCommentId) {
                commentMap[comment.parentCommentId.toString()]?.replies.push(comment);
            } else {
                rootComments.push(comment);
            }
        });

        res.json({
            status: 200,
            message: "Post fetched",
            data: {
                ...post,
                likeCount: post.likes.length,
                commentCount: comments.length,
                comments: rootComments,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const deletePost = async (req: any, res: Response, next: NextFunction) => {
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

export const togglePostLike = async (req: any, res: Response, next: NextFunction) => {
    try {
        const post: IPost = await PostModel.findById(req.params.id, undefined, undefined);
        if (!post) {
            return next(new AppError("Post not found", 404));
        }

        const userId = req.user!._id;
        const index = post.likes.findIndex(id => id.equals(userId));

        index === -1 ? post.likes.push(userId) : post.likes.splice(index, 1);
        await post.save();

        res.json(
            new CustomResponse(200, "Like updated", { likes: post.likes.length })
        );
    } catch (err) {
        next(err);
    }
}