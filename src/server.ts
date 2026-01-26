import express from 'express'
import {PORT} from "./config/env";

let app = express();

app.use(express.json())
app.use(express.urlencoded({extended: false}))


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})