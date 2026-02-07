import mongoose, {Document, Types} from "mongoose";

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
    password: string;
    email: string;
    phoneNumber: string;
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

export interface IPostComment extends mongoose.Document{
    _id: Types.ObjectId;
    postId: Types.ObjectId;
    userId: Types.ObjectId;
    parentCommentId?: Types.ObjectId | null;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IChat extends mongoose.Document {
    _id: Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    lastMessage?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessage extends mongoose.Document {
    _id: Types.ObjectId;
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    content: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}