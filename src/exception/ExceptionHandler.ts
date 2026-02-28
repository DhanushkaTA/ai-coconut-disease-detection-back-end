import { Request, Response, NextFunction } from "express";
import { AppError } from "../util/AppError";
import {NODE_ENV} from "../config/env";

export const exceptionHandler = (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.log(err.statusCode, err.status, err.name, err.message);
    console.log(err);
    
    
    err.statusCode = err.statusCode || 500;
    err.statusCode = err.name === "TokenExpiredError" ? 401 : err.statusCode;
    err.status = err.status || "error";

    if (NODE_ENV === "development") {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        });
        return;
    }

    // ===== PRODUCTION =====

    let error = { ...err };
    error.message = err.message;

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        error = new AppError("Invalid token. Please login again.", 401);
    }

    if (err.name === "TokenExpiredError") {
        error = new AppError("Token expired. Please login again.", 401);
    }

    // MongoDB errors
    if (err.name === "ValidationError") {
        error = new AppError(err.message, 422);
    }

    if (err.code === 11000) {
        error = new AppError("Duplicate field value entered", 409);
    }

    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    } else {
        console.error("🔥 UNEXPECTED ERROR:", err);

        res.status(500).json({
            status: "error",
            message: "Something went wrong"
        });
    }
};
