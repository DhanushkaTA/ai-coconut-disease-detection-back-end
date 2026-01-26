import mongoose, { Schema } from "mongoose";
import { IAlert } from "../type/schema.type";

const AlertSchema = new Schema<IAlert>(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        image: {
            type: String,
            required: false
        },

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

 let AlertModel = mongoose.model("Alert", AlertSchema);
 export default AlertModel;
