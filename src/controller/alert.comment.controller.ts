import { Request, Response, NextFunction } from "express";
import AlertModel from "../model/alert.model";
import { AppError } from "../util/AppError";
import { CustomResponse } from "../util/CustomResponse";
import AlertCommentModel from "../model/alert.comment.model";

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