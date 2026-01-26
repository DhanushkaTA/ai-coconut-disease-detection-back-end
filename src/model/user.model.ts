import mongoose from "mongoose";

const ROLES = ['user', 'admin', 'moderator'];

const UserSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ROLES,
            default: "user"
        }
    },
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

export default User
