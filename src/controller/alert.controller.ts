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

export const getAlertById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        let alert_id = req.params.id;
        if (!alert_id){
            throw new AppError(
                "Something is missing! Please check again and try again",
                400
            )
        }

        console.log(alert_id)

        const alert = await AlertModel.findById(alert_id)
            .populate("createdBy", "firstName lastName");

        if (!alert) {
            return next(new AppError("Alert not found", 404));
        }

        res.json(
            new CustomResponse(200, "Alert fetched", alert)
        );
    } catch (err) {
        next(err);
    }
};

export const updateAlert = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const alert = await AlertModel.findById(req.params.id);

        if (!alert) {
            return next(new AppError("Alert not found", 404));
        }

        if (!alert.createdBy.equals(req.user?._id)) {
            return next(new AppError("Unauthorized", 403));
        }

        Object.assign(alert, req.body);
        await alert.save();

        res.json(
            new CustomResponse(200, "Alert updated", alert)
        );
    } catch (err) {
        next(err);
    }
};

export const deleteAlert = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const alert = await AlertModel.findById(req.params.id);

        if (!alert) {
            return next(new AppError("Alert not found", 404));
        }

        if (!alert.createdBy.equals(req.user?._id)) {
            return next(new AppError("Unauthorized", 403));
        }

        await alert.deleteOne();

        res.json(
            new CustomResponse(200, "Alert deleted")
        );
    } catch (err) {
        next(err);
    }
};

export const toggleLike = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const alert = await AlertModel.findById(req.params.id);

        if (!alert) {
            return next(new AppError("Alert not found", 404));
        }

        const userId = req.user!._id;

        const index = alert.likes.findIndex(
            id => id.equals(userId)
        );

        if (index === -1) {
            alert.likes.push(userId);
        } else {
            alert.likes.splice(index, 1);
        }

        await alert.save();

        res.json(
            new CustomResponse(200, "Like updated", {
                likesCount: alert.likes.length
            })
        );
    } catch (err) {
        next(err);
    }
};