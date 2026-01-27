import { Request, Response, NextFunction } from "express";
import AlertModel from "../model/alert.model";
import { AppError } from "../util/AppError";
import { CustomResponse } from "../util/CustomResponse";
import AlertCommentModel from "../model/alert.comment.model";
import {IAlertComment} from "../type/schema.type";

export const addComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { content } = req.body;
        const { alertId } = req.params;

        const alertExists = await AlertModel.exists({ _id: alertId });
        if (!alertExists) {
            return next(new AppError("Alert not found", 404));
        }

        const comment = await AlertCommentModel.create({
            alertId,
            userId: req.user!._id,
            content
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
        const { alertId } = req.params;

        const comments =
            await AlertCommentModel.findById(alertId, undefined, undefined)
            .populate("userId", "firstName lastName profilePic")
            .sort({ createdAt: 1 });

        res.json(
            new CustomResponse(200, "Comments fetched", comments)
        );
    } catch (err) {
        next(err);
    }
};

export const updateComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const comment: IAlertComment =
            await AlertCommentModel.findById(req.params.commentId, undefined, undefined);

        if (!comment) {
            return next(new AppError("Comment not found", 404));
        }

        if (
            !comment.userId.equals(req.user!._id) &&
            req.user!.role !== "admin"
        ) {
            return next(new AppError("Unauthorized", 403));
        }

        comment.content = req.body.content;
        await comment.save();

        res.json(
            new CustomResponse(200, "Comment updated", comment)
        );
    } catch (err) {
        next(err);
    }
};