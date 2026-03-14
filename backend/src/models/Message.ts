import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        conversationId: { type: String, required: true, index: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        senderName: { type: String, required: true },
        content: { type: String, required: true },
        type: { type: String, enum: ['text', 'image', 'report'], default: 'text' },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
