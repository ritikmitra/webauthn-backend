import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { sendNotificationSingleDevice, sendNotificationMultipleDevices } from '../services/notification.services';
import { getUserDeviceTokens } from '../services/profile.services';

export const sendNotificationController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, title, body } = req.body;

        if (!userId || !title || !body) {
            throw new AppError('User ID, title, and body are required', 400);
        }
        const token = await getUserDeviceTokens(userId)
        if (!token || token.length === 0) {
            throw new AppError('No device tokens found for the user', 404);
        }

        // Extract device tokens from the token array
        const deviceTokens = token.map(t => t.deviceToken);
        if (deviceTokens.length > 1) {
            // If there are multiple device tokens, send notification to all
            const response = await sendNotificationMultipleDevices(deviceTokens, title, body);
            res.json({ success: true, response });
            return;
        } else {
            // If there is only one device token, send notification to that single device
            const response = await sendNotificationSingleDevice(deviceTokens[0], title, body);
            res.json({ success: true, response });
            return;
        }

    } catch (error) {
        next(error);
    }
};