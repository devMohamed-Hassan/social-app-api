import { JwtPayload } from "jsonwebtoken";
import { ENV } from "../../config/env";
import { IUser } from "../../models/user.model";
import { AppError } from "../../utils/AppError";
import { Token } from "./token";
import { UserRepository } from "../../repositories/user.repository";
import { HydratedDocument } from "mongoose";

export enum TokenTypes {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
}

interface DecodeOptions {
  tokenType?: TokenTypes;
  authorization?: string;
}

export interface Payload extends JwtPayload {
  _id: string;
  email?: string;
  jti?: string;
}

export const verifyToken = async ({
  tokenType = TokenTypes.ACCESS,
  authorization,
}: DecodeOptions): Promise<{
  user: HydratedDocument<IUser>;
  payload: Payload;
}> => {
  const userModle = new UserRepository();

  if (!authorization) {
    throw new AppError("Token is required", 401);
  }

  const [bearer, token] = authorization.split(" ");

  if (bearer !== ENV.BEARER_KEY) {
    throw new AppError("Invalid bearer key", 401);
  }

  if (!token) {
    throw new Error("Token is required");
  }

  const payload: Payload =
    tokenType === TokenTypes.ACCESS
      ? Token.verifyAccessToken(token)
      : Token.verifyRefreshToken(token);

  const user = await userModle.findById(payload._id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isVerified) {
    throw new AppError(
      "Account not verified. Please confirm your email first",
      403
    );
  }
  return { user, payload };
};
