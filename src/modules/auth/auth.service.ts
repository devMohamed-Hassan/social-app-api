import { IUser } from "./../../models/user.model";
import { NextFunction, Request, Response } from "express";
import { SignupDTO } from "./auth.dto";
import { HydratedDocument } from "mongoose";
import { AppError } from "../../utils/AppError";
import { UserRepository } from "../../repositories/user.repository";

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
    const { firstName, lastName, email, age, phone, password }: SignupDTO =
      req.body;

    const isExist = await this.userModel.findOne({ email });

    if (isExist) {
      throw new AppError("User already exists", 400);
    }
    const user: HydratedDocument<IUser> = await this.userModel.create({
      firstName,
      lastName,
      email,
      age,
      password,
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
      },
    });
  }
}
