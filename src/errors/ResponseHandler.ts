import type {  Response } from 'express';

export class ResponseHandler {
    static sendSuccess(res: Response, data: any, message: string = 'Request successful') {
      res.status(200).json({
        success: true,
        message,
        data,
      });
    }
  
    static sendError(res: Response, message: string, statusCode: number = 500) {
      res.status(statusCode).json({
        success: false,
        message,
      });
    }
  }
  