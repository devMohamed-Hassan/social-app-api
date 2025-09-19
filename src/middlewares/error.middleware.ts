import { NextFunction, Request, Response } from "express";
import { AppError, ValidationError } from "../utils/AppError";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: Record<string, any> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    if (err instanceof ValidationError) {
      errors = err.details;
    }
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
