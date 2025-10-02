import { EmailEventType } from "./../../services/email/emailEvents";
import { IUser } from "./../../models/user.model";
import { NextFunction, Request, Response } from "express";
import { ConfirmEmailDTO, SignupDTO } from "./auth.dto";
import { HydratedDocument } from "mongoose";
import { AppError } from "../../utils/AppError";
import { UserRepository } from "../../repositories/user.repository";
import { Bcrypt } from "../../utils/hash";
import emailEmitter from "../../services/email/emailEmitter";
import { buildOtp } from "../../utils/otp/buildOtp";

interface IAuthServices {
  signup(req: Request, res: Response, next: NextFunction): Promise<Response>;
}

export class AuthServices implements IAuthServices {
  private userModel = new UserRepository();

  constructor() {}

  async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    let { firstName, lastName, email, age, phone, password }: SignupDTO =
      req.body;

    const isExist = await this.userModel.findOne({ email });

    if (isExist) {
      throw new AppError("User already exists", 400);
    }

    password = await Bcrypt.hash(password);

    const emailOtp = buildOtp(5, 3);

    const user: HydratedDocument<IUser> = await this.userModel.create({
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

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        age: user.age,
        emailOtp,
      },
    });
  }

  async confirmEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { email, otp }: ConfirmEmailDTO = req.body;

    const user = await this.userModel.findOne({ email });

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

    return res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        age: user.age,
      },
    });
  }

  async resendEmailOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { email }: { email: string } = req.body;

    const user = await this.userModel.findOne({ email });

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

    return res.status(200).json({
      message: "A new OTP has been sent to your email",
    });
  }
}
