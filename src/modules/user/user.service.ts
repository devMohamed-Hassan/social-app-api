import fs from "fs";
import { S3Service } from "./../../services/s3.service";
import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/sendSuccess";
import { AppError } from "../../utils/AppError";
import { UserRepository } from "../../repositories/user.repository";

export interface IUserServices {
  profileImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
}

export class UserServices implements IUserServices {
  private userModel = new UserRepository();
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  profileImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    console.log({ file: req.file });

    const userId = req.user?.id;

    if (!req.file) {
      throw new AppError("No image file uploaded", 400);
    }

    const imageUrl = await this.s3Service.uploadFile(
      req.file,
      `users/${userId}/profile-images`
    );

    const updatedUser = await this.userModel.updateProfileImage(
      userId,
      imageUrl
    );

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Profile image uploaded successfully.",
      data: {
        user: updatedUser,
      },
    });
  };
}
