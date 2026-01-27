import mongoose from "mongoose";
import {IUser} from "../type/schema.type";

const ROLES = ["user", "admin", "moderator"] as const;

const UserSchema = new mongoose.Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        username: { type: String, required: true, unique: true },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phoneNumber: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true,
            select: false // hide by default
        },

        role: {
            type: String,
            enum: ROLES,
            default: "user"
        },

        profilePic: {
            type: String,
            required: false
        }
    },
    { timestamps: true }
);

let UserModel = mongoose.model("User", UserSchema);
export default UserModel;
