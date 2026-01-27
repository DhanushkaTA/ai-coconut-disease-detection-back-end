import mongoose, { Schema } from "mongoose";
import { IPost } from "../type/schema.type";

const PostSchema = new Schema<IPost>(
    {
        content: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String
        },

        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
