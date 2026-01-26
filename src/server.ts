import express from 'express'
import {PORT} from "./config/env";
import cors from 'cors'
import connectToDatabase from "./db/database";
import cookieParser from "cookie-parser";
import * as GlobalErrorHandler from "./exception/ExceptionHandler"
import {AppError} from "./util/AppError";
import {StatusCodes} from "./util/StatusCode";

let app = express();

//set cors police
app.use(
    cors({
        origin: '*',
        credentials: true,
    })
)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// 1. Define your specific routes
app.get('/', (req, res) => {
    res.send('<h1>Home page</h1>');
});

app.get('/products', (req, res) => {
    res.send('<h1>Products page</h1>');
});


// this should always be the end of the routs
//this is for unhandled routes
app.use((
    req:express.Request,
    res: express.Response,
    next:express.NextFunction
) => {
    next(
        new AppError(
            `Can't find ${req.originalUrl} path on the auth server`,
            404,
            StatusCodes.URL_NOT_FOUND
        ));
})

//set global error handler middleware
app.use(GlobalErrorHandler.exceptionHandler)

app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`)

    // connect to database
    await connectToDatabase();
})