import mongoose, { Types } from "mongoose";

export interface IAlert extends mongoose.Document{
    _id: Types.ObjectId;
    title: string;
    description: string;
    image?: string;
    likes: Types.ObjectId[];
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser extends mongoose.Document {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: string;
    _id: mongoose.Types.ObjectId;
}

export interface IAlertComment extends mongoose.Document{
    _id: Types.ObjectId;
    alertId: Types.ObjectId;
    userId: Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPost extends mongoose.Document{
    _id: Types.ObjectId;
    content: string;
    image?: string;
    likes: Types.ObjectId[];
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}