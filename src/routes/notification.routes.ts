import { Router } from 'express';
import {
    sendNotificationController,
} from '../controllers/notification.controller';


export const notificationRouter = Router();
notificationRouter.post('/send-notification', sendNotificationController);