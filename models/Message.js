import mongoose from "mongoose";
const { Schema, model } = mongoose;

const MessageSchema = new Schema({
    to_user: { type: String, required: true },
    from_name: { type: String, required: true },
    from_email: { type: String },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Message || model("Message", MessageSchema);
