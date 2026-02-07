import mongoose, { Schema, Document } from "mongoose";
import {IMessage} from "../../type/schema.type";

const MessageSchema = new Schema<IMessage>(
    {
        chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        isRead: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
