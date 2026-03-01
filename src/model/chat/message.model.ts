import mongoose, { Schema, Document } from "mongoose";
import {IMessage} from "../../type/schema.type";

const MessageSchema = new Schema<IMessage>(
    {
        chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        image: {type: String},
        isRead: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Index for faster unread counting
MessageSchema.index({ chatId: 1, receiverId: 1, isRead: 1 });

let MessageModel = mongoose.model("Message", MessageSchema);
export default MessageModel
