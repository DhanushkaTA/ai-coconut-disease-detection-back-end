import { Request, Response, NextFunction } from "express";
import AlertModel from "../model/alert.model";
import { AppError } from "../util/AppError";
import { CustomResponse } from "../util/CustomResponse";

export const createAlert = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { title, description, image } = req.body;

        if(!title || !description ){
            throw new AppError(
                "Something is missing! Please check again and try again",
                400
            )
        }

        const alert = await AlertModel.create({
            title,
            description,
            image,
            createdBy: req.user?._id
        });

        res.status(201).json(
            new CustomResponse(201, "Alert created", alert)
        );
    } catch (err) {
        next(err);
    }
};

export const getAllAlerts = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const alerts = await AlertModel.find()
            .populate("createdBy", "firstName lastName role")
            .sort({ createdAt: -1 });

        res.json(
            new CustomResponse(200, "Alerts fetched", alerts)
        );
    } catch (err) {
        next(err);
    }
};
