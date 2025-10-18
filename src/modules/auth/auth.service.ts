import { EmailEventType } from "./../../services/email/emailEvents";
import { IUser } from "./../../models/user.model";
import { NextFunction, Request, Response } from "express";
import {
  ConfirmEmailDTO,
  LoginDTO,
  ResetPasswordDTO,
  SignupDTO,
} from "./auth.dto";
import { HydratedDocument } from "mongoose";
import { AppError } from "../../utils/AppError";
import { UserRepository } from "../../repositories/user.repository";
import emailEmitter from "../../services/email/emailEmitter";
import { buildOtp } from "../../utils/otp/buildOtp";
import { sendSuccess } from "../../utils/sendSuccess";
import { Token } from "../../services/token/token";
import { TokenTypes, verifyToken } from "../../services/token/verifyToken";
import { nanoid } from "nanoid";

interface IAuthServices {
  signup(req: Request, res: Response, next: NextFunction): Promise<Response>;
}

export class AuthServices implements IAuthServices {
  private UserModel = new UserRepository();

  constructor() {}

  signup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { firstName, lastName, email, age, phone, password }: SignupDTO =
      req.body;

    const isExist = await this.UserModel.findByEmail(email);

    if (isExist) {
      throw new AppError("User already exists", 400);
    }

    const emailOtp = buildOtp(5, 3);

    const user: HydratedDocument<IUser> = await this.UserModel.create({
      firstName,
      lastName,
      email,
      age,
      phone,
      password,
      emailOtp,
    });

    emailEmitter.emit("sendEmail", {
      type: "confirmEmail" as EmailEventType,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: user.emailOtp?.code,
    });

    return sendSuccess({
      res,
      statusCode: 201,
      message: "User created successfully",
      data: { user: await user.getSignedUserData() },
    });
  };

  confirmEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email, otp }: ConfirmEmailDTO = req.body;

    const user = await this.UserModel.findByEmail(email);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
      throw new AppError("Email already verified", 400);
    }

    if (!user.emailOtp) {
      throw new AppError("No OTP found. Please request a new one.", 400);
    }

    if (user.emailOtp.expiresAt.getTime() <= Date.now()) {
      user.emailOtp = undefined;
      await user.save();
      throw new AppError("OTP expired. Please request a new one.", 400);
    }

    if (user.emailOtp.attempts >= user.emailOtp.maxAttempts) {
      user.emailOtp = undefined;
      await user.save();
      throw new AppError(
        "Maximum OTP attempts reached. Please request a new one.",
        400
      );
    }

    if (user.emailOtp.code !== otp) {
      user.emailOtp.attempts += 1;
      await user.save();
      throw new AppError("Invalid OTP", 400);
    }

    user.isVerified = true;
    user.emailOtp = undefined;
    await user.save();

    emailEmitter.emit("sendEmail", {
      type: "welcomeEmail",
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: "",
    });

    const payload = {
      _id: user._id,
      email: user.email,
    };

    const jwtid = nanoid();

    const accessToken = Token.generateAccessToken(payload, { jwtid });
    const refreshToken = Token.generateRefreshToken(payload, { jwtid });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Email verified successfully",
      data: {
        user: await user.getSignedUserData(),
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  };

  resendEmailOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email }: { email: string } = req.body;

    const user = await this.UserModel.findByEmail(email);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.isVerified) {
      throw new AppError("Email is already verified", 400);
    }

    const newOtp = buildOtp(5, 3);

    user.emailOtp = newOtp;

    await user.save();

    emailEmitter.emit("sendEmail", {
      type: "confirmEmail" as EmailEventType,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: user.emailOtp.code,
    });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "A new OTP has been sent to your email",
      data: {
        expiry: user.emailOtp.expiresAt,
        expiresIn: user.emailOtp.expiresAt.getTime() - Date.now(),
      },
    });
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email, password }: LoginDTO = req.body;

    const user = await this.UserModel.findByEmailWithPassword(email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email before logging in", 403);
    }

    const payload = {
      _id: user._id,
      email: user.email,
    };

    const jwtid = nanoid();

    const accessToken = Token.generateAccessToken(payload, { jwtid });
    const refreshToken = Token.generateRefreshToken(payload, { jwtid });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Login successful",
      data: {
        user: await user.getSignedUserData(),
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError("Token is required", 401);
    }

    const { user, payload } = await verifyToken({
      tokenType: TokenTypes.REFRESH,
      authorization,
    });

    const newPayload = {
      _id: user._id as string,
      email: user.email,
    };
    const jwtid = payload.jti;

    const accessToken = Token.generateAccessToken(newPayload, { jwtid });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Access token refreshed successfully",
      data: {
        accessToken,
      },
    });
  };

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email }: { email: string } = req.body;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const user = await this.UserModel.findByEmail(email);

    if (!user) {
      throw new AppError("No account found with this email", 404);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email first", 403);
    }

    const otp = buildOtp(5, 3);
    user.passwordOtp = otp;
    user.credentialChangedAt = new Date();
    await user.save();

    emailEmitter.emit("sendEmail", {
      type: "forgotPassword" as EmailEventType,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: user.passwordOtp?.code,
    });

    return sendSuccess({
      res,
      statusCode: 202,
      message: "Password reset OTP has been sent to your email",
      data: {
        expiry: user.passwordOtp.expiresAt,
        expiresIn: otp.expiresAt.getTime() - Date.now(),
      },
    });
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email, otp, password }: ResetPasswordDTO = req.body;

    const user = await this.UserModel.findByEmail(email);

    if (!user) {
      throw new AppError("No account found with this email", 404);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email first", 403);
    }

    if (!user.passwordOtp || !user.passwordOtp.code) {
      throw new AppError("No OTP request found. Please request again", 400);
    }

    if (user.passwordOtp.expiresAt < new Date()) {
      user.passwordOtp = undefined;
      await user.save();
      throw new AppError("OTP expired. Please request again", 400);
    }

    if (user.passwordOtp.attempts >= user.passwordOtp.maxAttempts) {
      user.passwordOtp = undefined;
      user.save();
      throw new AppError(
        "Too many invalid attempts. Please request a new OTP",
        429
      );
    }

    if (user.passwordOtp.code !== otp) {
      user.passwordOtp.attempts += 1;
      await user.save();
      throw new AppError("Invalid OTP. Please check and try again", 400);
    }

    user.password = password;
    user.passwordOtp = undefined;
    user.credentialChangedAt = new Date();
    await user.save();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Password reset successfully",
    });
  };
}
