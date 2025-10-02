import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { ENV } from "../../config/env";

export class Token {
  private static readonly accessSecret = ENV.ACCESS_TOKEN_SECRET;
  private static readonly refreshSecret = ENV.REFRESH_TOKEN_SECRET;

  static generateAccessToken(payload: object, options?: SignOptions): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: "1h",
      ...options,
    });
  }

  static generateRefreshToken(payload: object, options?: SignOptions): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: "7d",
      ...options,
    });
  }

  static verifyAccessToken<T extends object = JwtPayload>(token: string): T {
    return jwt.verify(token, this.accessSecret) as T;
  }

  static verifyRefreshToken<T extends object = JwtPayload>(token: string): T {
    return jwt.verify(token, this.refreshSecret) as T;
  }

  static decodeToken(token: string): null | JwtPayload | string {
    return jwt.decode(token);
  }
}
