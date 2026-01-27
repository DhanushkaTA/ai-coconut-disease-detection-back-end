import mongoose, { Schema } from "mongoose";
import { IAlertComment } from "../type/schema.type";

const CommentSchema = new Schema<IAlertComment>(
    {
        alertId: {
            type: Schema.Types.ObjectId,
            ref: "Alert",
            required: true,
            index: true
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        }
    },
    { timestamps: true }
);

export default mongoose.model("AlertComment", CommentSchema);
