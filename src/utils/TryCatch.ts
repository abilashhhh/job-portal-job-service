import {Request, Response, NextFunction, RequestHandler} from "express"
import ErrorHandler from "./errorHandler.js";

export const TryCatch = (controller: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error: any) {
      if (error instanceof ErrorHandler) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      return res.status(500).json({ message: error?.message || "Internal Server Error" });
    }
  };
}