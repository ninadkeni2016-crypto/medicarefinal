import { Request, Response } from 'express';
import Notification from '../models/Notification';

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notification) { res.status(404).json({ message: 'Notification not found' }); return; }
        res.json(notification);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
        res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ message: 'Notification removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
