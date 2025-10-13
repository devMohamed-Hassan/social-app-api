import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { AppError, ValidationError } from "../utils/AppError";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: Record<string, any> | undefined;

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;

    switch (err.code) {
      case "LIMIT_UNEXPECTED_FILE":
        message = "Too many files uploaded or unexpected field name.";
        break;
      case "LIMIT_FILE_SIZE":
        message = "Uploaded file is too large.";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files uploaded.";
        break;
      case "LIMIT_PART_COUNT":
        message = "Too many parts in the form data.";
        break;
      default:
        message = err.message;
    }
  }

  // AppError (custom)
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    if (err instanceof ValidationError) {
      errors = err.details;
    }
  }

  // JWT errors
  else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token expired.";
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token.";
  }

  // Send JSON response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};
