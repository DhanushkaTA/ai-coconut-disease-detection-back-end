import mongoose, { Schema } from "mongoose";
import { IPostComment } from "../type/schema.type";

const PostCommentSchema = new Schema<IPostComment>(
    {
        postId: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: true,
            index: true
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        parentCommentId: {
            type: Schema.Types.ObjectId,
            ref: "PostComment",
            default: null
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

export default mongoose.model(
    "PostComment",
    PostCommentSchema
);
