import { Request, Response, NextFunction } from "express";
import AlertModel from "../model/alert.model";
import { AppError } from "../util/AppError";
import { CustomResponse } from "../util/CustomResponse";
import { log } from "console";
import AlertCommentModel from "../model/alert.comment.model";

export const createAlert = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const { title, description, image } = req.body;

        console.log(req.body)
        console.log(req.user?.userId)

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
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search as string;

        const skip = (page - 1) * limit;

        // 🔥 search condition
        const searchFilter = search
        ? {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ],
            }
        : {};

        const totalCount = await AlertModel.countDocuments(searchFilter);

        const totalPages = Math.ceil(totalCount / limit);

        const alerts = await AlertModel.find(searchFilter)
        .populate("createdBy", "firstName lastName role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        res.json(
        new CustomResponse(
            200,
            "Alerts fetched",
            alerts,
            totalPages
        )
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
            .populate("createdBy", "firstName lastName profilePic");

        if (!alert) {
            return next(new AppError("Alert not found", 404));
        }

         const commentCount = await AlertCommentModel.countDocuments({
            alertId: alert._id,
        });

        res.json(
            new CustomResponse(200, "Alert fetched", {
                ...alert.toObject(),
                likeCount: alert.likes.length,
                commentCount,
            })
        );
    } catch (err) {
        next(err);
    }
};

export const updateAlert = async (
    req: any,
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
    req: any,
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
    req:  any,
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

export const getLatestAlerts = async (
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // console.log('Here i am')
        const alerts = await AlertModel.find()
            .populate("createdBy", "firstName lastName role")
            .sort({ createdAt: -1 }) // newest first
            .limit(5);              // only 5 alerts

        res.status(200).json(
            new CustomResponse(200, "Latest alerts fetched", alerts)
        );
    } catch (err) {
        next(err);
    }
};

export const getTodayAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const alerts = await AlertModel.find({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
    .populate("createdBy", "firstName lastName role")
    .sort({ createdAt: -1 });

    // res.status(200).json({
    //   success: true,
    //   count: alerts.length,
    //   data: alerts,
    // });

    res.status(200).json(
            new CustomResponse(200, "Today's alerts fetched", alerts)
        );
  } catch (err) {
    // res.status(500).json({
    //   success: false,
    //   message: "Failed to fetch today's alerts",
    // });
    next(err);
  }
};