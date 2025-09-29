import { NextFunction, Request, Response } from "express";
import { SignupDTO } from "./auth.dto";
import { HydratedDocument, Model } from "mongoose";
import { IUser, UserModel } from "../../models/user.model";

interface IAuthServices {
  signup(req: Request, res: Response, next: NextFunction): Promise<Response>;
}

export class AuthServices implements IAuthServices {
  private userModel: Model<IUser> = UserModel;
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
      res.status(400).json({ message: "Email already exists" });
    }

    const user: HydratedDocument<IUser> = await this.userModel.create({
      firstName,
      lastName,
      email,
      phone,
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
