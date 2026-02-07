import mongoose, { Schema, Document } from "mongoose";
import {IChat} from "../../type/schema.type";

const ChatSchema = new Schema<IChat>(
    {
        participants: [
            { type: Schema.Types.ObjectId, ref: "User", required: true }
        ],
        lastMessage: { type: Schema.Types.ObjectId, ref: "Message" }
    },
    { timestamps: true }
);

let ChatModel = mongoose.model("Chat", ChatSchema);
export default ChatModel;