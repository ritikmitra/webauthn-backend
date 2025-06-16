import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ResponseHandler } from '../errors/ResponseHandler';
import { isAuthenticated } from "../utils/authentication"
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    //custom error, return with message and status code
    ResponseHandler.sendError(res, err.message, err.statusCode, err.data);
  } else {
    // Internal server error
    console.error(err.stack);
    ResponseHandler.sendError(res, 'Internal Server Error');
  }
};

export const protectedRoute = (req: Request, res: Response, next: NextFunction) => {
  // Check if the user is authenticated
  if (!isAuthenticated(req)) {
    // If not authenticated, return an error response
    return ResponseHandler.sendError(res, 'Unauthorized', 401);
  }
  
  // If authenticated, proceed to the next middleware or route handler
  next();
}