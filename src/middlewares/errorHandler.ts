import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ResponseHandler } from '../errors/ResponseHandler';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    //custom error, return with message and status code
    ResponseHandler.sendError(res, err.message, err.statusCode,err.data);
  } else {
    // Internal server error
    console.error(err.stack);
    ResponseHandler.sendError(res, 'Internal Server Error');
  }
};
