import { Router } from 'express';

import { getUserProfileController,updateUserProfileController } from '../controllers/profileController';
import { protectedRoute } from '../middlewares/errorHandler';

export const profileRouter = Router();

profileRouter.get('/profile',protectedRoute, getUserProfileController);

profileRouter.put('/profile', protectedRoute, updateUserProfileController);