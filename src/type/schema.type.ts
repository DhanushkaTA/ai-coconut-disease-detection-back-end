import { Types } from "mongoose";

export interface IAlert {
    _id: Types.ObjectId;
    title: string;
    description: string;
    image?: string;
    likes: Types.ObjectId[];
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
