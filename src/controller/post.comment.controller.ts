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
        console.log(req.body);
        
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

export const getCommentsByAlertV2 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    // 1️⃣ Count total root comments
    const totalRootComments = await PostCommentSchema.countDocuments({
      postId,
      parentCommentId: null,
    });

    // 2️⃣ Get paginated root comments
    const rootComments = await PostCommentSchema.find({
      postId,
      parentCommentId: null,
    })
      .populate("userId", "firstName lastName profilePic")
      .sort({ createdAt: -1 }) // newest first (recommended)
      .skip(skip)
      .limit(limit);

    const rootIds = rootComments.map((c) => c._id);

    // 3️⃣ Get replies for those root comments
    const replies = await PostCommentSchema.find({
      parentCommentId: { $in: rootIds },
    })
      .populate("userId", "firstName lastName profilePic")
      .sort({ createdAt: 1 });

    // 4️⃣ Attach replies to their parents
    const commentMap = new Map<string, any>();

    rootComments.forEach((comment: any) => {
      commentMap.set(comment._id.toString(), {
        ...comment.toObject(),
        replies: [],
      });
    });

    replies.forEach((reply: any) => {
      const parent = commentMap.get(reply.parentCommentId.toString());
      if (parent) {
        parent.replies.push(reply);
      }
    });

    const finalComments = Array.from(commentMap.values());

    res.json(
      new CustomResponse(200, "Comments fetched", {
        comments: finalComments,
        currentPage: page,
        totalPages: Math.ceil(totalRootComments / limit),
        totalComments: totalRootComments,
        hasMore: page * limit < totalRootComments,
      })
    );
  } catch (err) {
    next(err);
  }
};