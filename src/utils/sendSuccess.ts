import { Response } from "express";

interface SuccessResponseOptions<T> {
  res: Response;
  message?: string;
  data?: T;
  statusCode?: number;
}

export const sendSuccess = <T>({
  res,
  statusCode = 200,
  message = "Success",
  data,
}: SuccessResponseOptions<T>) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
};
