import express from 'express'
import {PORT} from "./config/env";
import connectToDatabase from "./db/database";
import cookieParser from "cookie-parser";

let app = express();

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser());

app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`)

    // connect to database
    await connectToDatabase();
})