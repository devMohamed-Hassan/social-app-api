import { EmailEventType } from "./../../services/email/emailEvents";
import { IUser } from "./../../models/user.model";
import { NextFunction, Request, Response } from "express";
import {
  ConfirmDisable2FADTO,
  ConfirmEmailDTO,
  ConfirmEmailUpdateDTO,
  ConfirmEnable2FADTO,
  ForgotPasswordDTO,
  Login2FADTO,
  LoginDTO,
  ResendEmailOtpDTO,
  ResetPasswordDTO,
  SignupDTO,
  UpdateEmailDTO,
  UpdatePasswordDTO,
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
    const {
      firstName,
      lastName,
      email,
      age,
      phone,
      gender,
      password,
    }: SignupDTO = req.body;

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
      gender,
      password,
      emailOtp,
    });

    emailEmitter.emit("sendEmail", {
      type: EmailEventType.ConfirmEmail,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: emailOtp.code,
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

    const isValidOtp = await user.emailOtp.compareOtp?.(otp);

    if (!isValidOtp) {
      user.emailOtp.attempts += 1;
      await user.save();
      throw new AppError("Invalid OTP", 400);
    }

    user.isVerified = true;
    user.emailOtp = undefined;
    await user.save();

    emailEmitter.emit("sendEmail", {
      type: EmailEventType.WelcomeEmail,
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
    const { email }: ResendEmailOtpDTO = req.body;

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
      type: EmailEventType.ConfirmEmail,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: newOtp.code,
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

    if (user.twoFactorEnabled) {
      const otp = buildOtp(5, 3);
      user.twoFactorOtp = otp;
      await user.save();

      emailEmitter.emit("sendEmail", {
        type: EmailEventType.Login2FA,
        email: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        otp: otp.code,
      });

      return sendSuccess({
        res,
        statusCode: 200,
        message: "OTP sent to your email for login verification",
      });
    }

    const payload = {
      _id: user._id,
      email: user.email,
    };

    const jwtid = nanoid();

    const accessToken = Token.generateAccessToken(payload, { jwtid });
    const refreshToken = Token.generateRefreshToken(payload, { jwtid });

    emailEmitter.emit("sendEmail", {
      type: EmailEventType.LoginAlert,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      loginDetails: {
        ip: req.ip || "Unknown",
        userAgent: req.headers["user-agent"] || "Unknown",
        time: new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo" }),
        location: "Cairo, Egypt",
      },
    });

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
    const { email }: ForgotPasswordDTO = req.body;

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
      type: EmailEventType.ForgotPassword,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: otp.code,
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

    const isValidOtp = await user.passwordOtp.compareOtp?.(otp);

    if (!isValidOtp) {
      user.passwordOtp.attempts += 1;
      await user.save();
      throw new AppError("Invalid OTP. Please check and try again", 400);
    }

    user.password = password;
    user.passwordOtp = undefined;
    user.credentialChangedAt = new Date();
    await user.save();

    emailEmitter.emit("sendEmail", {
      type: EmailEventType.PasswordChanged,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: "",
    });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Password reset successfully",
    });
  };

  updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { oldPassword, newPassword }: UpdatePasswordDTO = req.body;

    const userId = req.user?._id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await this.UserModel.findByIdWithPassword(userId as string);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new AppError("Incorrect old password", 400);
    }

    user.password = newPassword;
    user.credentialChangedAt = new Date();
    await user.save();

    emailEmitter.emit("sendEmail", {
      type: EmailEventType.PasswordChanged,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: "",
    });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Password updated successfully",
    });
  };

  updateEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { newEmail, password }: UpdateEmailDTO = req.body;
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await this.UserModel.findByIdWithPassword(userId as string);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Incorrect password", 400);
    }

    const isEmailTaken = await this.UserModel.findByEmail(newEmail);
    if (isEmailTaken) {
      throw new AppError("This email is already in use", 400);
    }

    const emailChangeOtp = buildOtp(5, 3);

    user.pendingEmail = newEmail;
    user.updateEmailOtp = emailChangeOtp;
    await user.save();

    emailEmitter.emit("sendEmail", {
      type: EmailEventType.ChangeEmail,
      email: newEmail,
      userName: `${user.firstName} ${user.lastName}`,
      otp: emailChangeOtp.code,
    });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "OTP sent to your new email address for confirmation",
      data: {
        expiry: emailChangeOtp.expiresAt,
        expiresIn: emailChangeOtp.expiresAt.getTime() - Date.now(),
      },
    });
  };

  confirmEmailUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { otp }: ConfirmEmailUpdateDTO = req.body;

    const userId = req.user?._id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await this.UserModel.findById(userId as string);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.pendingEmail || !user.updateEmailOtp) {
      throw new AppError("No pending email change found", 400);
    }

    if (user.updateEmailOtp.expiresAt.getTime() < Date.now()) {
      user.updateEmailOtp = undefined;
      user.pendingEmail = undefined;
      await user.save();
      throw new AppError("OTP has expired, please request a new one", 400);
    }

    const isValidOtp = await user.updateEmailOtp.compareOtp?.(otp);

    if (!isValidOtp) {
      user.updateEmailOtp.attempts += 1;

      if (user.updateEmailOtp.attempts >= user.updateEmailOtp.maxAttempts) {
        user.updateEmailOtp = undefined;
        user.pendingEmail = undefined;
        await user.save();
        throw new AppError(
          "Too many invalid attempts, please request a new OTP",
          400
        );
      }

      await user.save();
      throw new AppError("Invalid OTP", 400);
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.updateEmailOtp = undefined;
    await user.save();

    emailEmitter.emit("sendEmail", {
      type: EmailEventType.EmailChanged,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: "",
    });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Email address updated successfully",
    });
  };

  enable2FARequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const userId = req.user?._id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const user = await this.UserModel.findById(userId as string);
    if (!user) throw new AppError("User not found", 404);

    if (user.twoFactorEnabled) {
      throw new AppError("2-Step Verification is already enabled", 400);
    }

    if (user.twoFactorOtp && user.twoFactorOtp.expiresAt > new Date()) {
      throw new AppError(
        "OTP already sent. Please wait or check your email.",
        400
      );
    }

    const otp = buildOtp(5, 3);
    user.twoFactorOtp = otp;
    await user.save();

    emailEmitter.emit("sendEmail", {
      type: EmailEventType.Enable2FA,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: otp.code,
    });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "OTP sent to your email for enabling 2FA",
    });
  };

  confirmEnable2FA = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { otp }: ConfirmEnable2FADTO = req.body;
    const userId = req.user?._id;

    if (!userId) throw new AppError("Unauthorized", 401);
    const user = await this.UserModel.findById(userId as string);
    if (!user || !user.twoFactorOtp) throw new AppError("No OTP found", 400);

    if (user.twoFactorOtp.expiresAt.getTime() < Date.now()) {
      user.twoFactorOtp = undefined;
      await user.save();
      throw new AppError("OTP expired. Please request a new one.", 400);
    }

    const isValid = await user.twoFactorOtp.compareOtp?.(otp);
    if (!isValid) {
      user.twoFactorOtp.attempts += 1;

      if (user.twoFactorOtp.attempts >= user.twoFactorOtp.maxAttempts) {
        user.twoFactorOtp = undefined;
        await user.save();
        throw new AppError(
          "Too many invalid attempts. Please request a new OTP.",
          400
        );
      }

      await user.save();
      throw new AppError("Invalid OTP", 400);
    }

    user.twoFactorEnabled = true;
    user.twoFactorOtp = undefined;
    await user.save();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "2-Step Verification has been enabled successfully",
    });
  };

  login2FA = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { email, otp }: Login2FADTO = req.body;

    const user = await this.UserModel.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid email or password", 400);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email before logging in", 403);
    }

    if (!user.twoFactorEnabled) {
      throw new AppError(
        "2-Step Verification is not enabled for this account",
        400
      );
    }

    if (!user.twoFactorOtp) {
      throw new AppError("No 2FA verification in progress", 400);
    }

    if (user.twoFactorOtp.expiresAt.getTime() < Date.now()) {
      user.twoFactorOtp = undefined;
      await user.save();
      throw new AppError("OTP expired. Please log in again.", 400);
    }

    const isValid = await user.twoFactorOtp.compareOtp?.(otp);
    if (!isValid) {
      user.twoFactorOtp.attempts += 1;

      if (user.twoFactorOtp.attempts >= user.twoFactorOtp.maxAttempts) {
        user.twoFactorOtp = undefined;
        await user.save();
        throw new AppError(
          "Too many invalid attempts. Please log in again.",
          400
        );
      }

      await user.save();
      throw new AppError("Invalid OTP", 400);
    }

    user.twoFactorOtp = undefined;
    await user.save();

    const payload = {
      _id: user._id,
      email: user.email,
    };

    const jwtid = nanoid();

    const accessToken = Token.generateAccessToken(payload, { jwtid });
    const refreshToken = Token.generateRefreshToken(payload, { jwtid });

    emailEmitter.emit("sendEmail", {
      type: EmailEventType.LoginAlert,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      loginDetails: {
        ip: req.ip || "Unknown",
        userAgent: req.headers["user-agent"] || "Unknown",
        time: new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo" }),
        location: "Cairo, Egypt",
      },
    });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Login successful (2FA verified)",
      data: {
        user: await user.getSignedUserData(),
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  };

  disable2FA = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const user = await this.UserModel.findById(userId as string);
    if (!user) throw new AppError("User not found", 404);

    if (!user.twoFactorEnabled) {
      throw new AppError("2-Step Verification is not enabled", 400);
    }

    const otp = buildOtp(5, 3);
    user.twoFactorOtp = otp;
    await user.save();

    emailEmitter.emit("sendEmail", {
      type: EmailEventType.Disable2FA,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      otp: otp.code,
    });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "OTP sent to your email to confirm disabling 2FA",
    });
  };

  confirmDisable2FA = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { otp }: ConfirmDisable2FADTO = req.body;
    const userId = req.user?._id;

    if (!userId) throw new AppError("Unauthorized", 401);

    const user = await this.UserModel.findById(userId as string);
    if (!user || !user.twoFactorEnabled || !user.twoFactorOtp)
      throw new AppError("No 2FA disable process in progress", 400);

    if (user.twoFactorOtp.expiresAt.getTime() < Date.now()) {
      user.twoFactorOtp = undefined;
      await user.save();
      throw new AppError("OTP expired, please request again", 400);
    }

    const isValid = await user.twoFactorOtp.compareOtp?.(otp);
    if (!isValid) {
      user.twoFactorOtp.attempts += 1;

      if (user.twoFactorOtp.attempts >= user.twoFactorOtp.maxAttempts) {
        user.twoFactorOtp = undefined;
        await user.save();
        throw new AppError(
          "Too many invalid attempts. Please request again.",
          400
        );
      }

      await user.save();
      throw new AppError("Invalid OTP", 400);
    }

    user.twoFactorEnabled = false;
    user.twoFactorOtp = undefined;
    await user.save();

    emailEmitter.emit("sendEmail", {
      type: EmailEventType.Disable2FAConfirmed,
      email: user.email,
      userName: `${user.firstName} ${user.lastName}`,
    });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "2-Step Verification has been disabled successfully",
    });
  };
}
