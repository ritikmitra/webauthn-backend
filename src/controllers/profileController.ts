import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { getUserProfile, updateUserProfile } from '../services/profileServices';
import { customJwtPayload } from '../types/constant';


export const getUserProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user! ;
    const data = await getUserProfile(userId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfileController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user! as customJwtPayload;
    const { displayName } = req.body;

    if (!displayName) {
      throw new AppError('Display name is required', 400);
    }

    const updatedUser = await updateUserProfile(userId, displayName);
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};