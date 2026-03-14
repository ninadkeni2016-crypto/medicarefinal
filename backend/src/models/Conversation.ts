import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        participantNames: [{ type: String }],
        lastMessage: { type: String, default: '' },
        lastMessageTime: { type: Date, default: Date.now },
        unreadCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
