import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/token/verifyToken";
import { AppError } from "../utils/AppError";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new AppError("Token is required", 401);
  }

  const { user, payload } = await verifyToken({ authorization });
  req.user = user;
  req.payload = payload;

  next();
};
