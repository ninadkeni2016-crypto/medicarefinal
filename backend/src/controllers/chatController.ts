import { Request, Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';

// @desc    Get all conversations for the logged-in user
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req: Request, res: Response): Promise<void> => {
    try {
        const conversations = await Conversation.find({ participants: req.user._id }).sort({ lastMessageTime: -1 });
        res.json(conversations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const messages = await Message.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 });
        // Mark messages as read
        await Message.updateMany({ conversationId: req.params.conversationId, sender: { $ne: req.user._id }, read: false }, { $set: { read: true } });
        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    const { conversationId, content, type, receiverId, receiverName } = req.body;
    try {
        let conversation = await Conversation.findOne({ _id: conversationId }).catch(() => null);

        // Create conversation if it doesn't exist yet
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, receiverId],
                participantNames: [req.user.name, receiverName],
                lastMessage: content,
                lastMessageTime: new Date(),
            });
        }

        const message = await Message.create({
            conversationId: conversation._id.toString(),
            sender: req.user._id,
            senderName: req.user.name,
            content,
            type: type || 'text',
        });

        // Update conversation's last message
        conversation.lastMessage = content;
        conversation.lastMessageTime = new Date();
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        await conversation.save();

        res.status(201).json(message);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
