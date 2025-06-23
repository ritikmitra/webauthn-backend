import { Router } from 'express';

import { getUserProfileController,updateUserProfileController,getAllUsersController , getUserByIdController} from '../controllers/profile.controller';
import { protectedRoute } from '../middlewares/errorHandler';

export const profileRouter = Router();

profileRouter.get('/profile',protectedRoute, getUserProfileController);

profileRouter.put('/profile', protectedRoute, updateUserProfileController);

profileRouter.get('/users', protectedRoute, getAllUsersController);

profileRouter.get('/user/:id', protectedRoute, getUserByIdController);