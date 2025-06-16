import { Router } from 'express';

import { getUserProfileController,updateUserProfileController,getAllUsersController } from '../controllers/profile.controller';
import { protectedRoute } from '../middlewares/errorHandler';

export const profileRouter = Router();

profileRouter.get('/profile',protectedRoute, getUserProfileController);

profileRouter.put('/profile', protectedRoute, updateUserProfileController);

profileRouter.get('/users', protectedRoute, getAllUsersController);