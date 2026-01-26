export class AppError extends Error {
    public statusCode: number;
    public status: "fail" | "error";
    public isOperational: boolean;
    public customStatusCode?: number;

    constructor(message: string, statusCode: number, customStatusCode?: number) {
        super(message);

        this.statusCode = statusCode;
        this.customStatusCode = customStatusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
        this.isOperational = true;

        // Error.captureStackTrace(this, this.constructor);
    }
}