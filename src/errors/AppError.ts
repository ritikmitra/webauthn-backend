export class AppError extends Error {
    statusCode: number;
    data : any
    constructor(message: string, statusCode: number,data?: any) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      this.data = data
    }
  }
  