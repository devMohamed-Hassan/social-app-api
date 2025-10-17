import { S3Service } from "./../../services/s3.service";
import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/sendSuccess";
import { AppError } from "../../utils/AppError";
import { UserRepository } from "../../repositories/user.repository";
import mime from "mime-types";

export interface IUserServices {
  profileImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
}

export class UserServices implements IUserServices {
  private UserModel = new UserRepository();
  private s3Service = new S3Service();

  constructor() {
  }

  profileImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const userId = req.user?.id;

    if (!req.file) {
      throw new AppError("No image file uploaded", 400);
    }

    const user = await this.UserModel.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.profileImage) {
      await this.s3Service.deleteFile(user.profileImage);
    }

    const newKey = await this.s3Service.uploadFile(
      req.file,
      `users/${userId}/profile-images`
    );

    const updatedUser = await this.UserModel.updateProfileImage(userId, newKey);

    const userData = await updatedUser!.getSignedUserData();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Profile image uploaded successfully.",
      data: {
        user: userData,
      },
    });
  };

  generatePresignedProfileUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const userId = req.user?.id;
    const { fileName, mimeType } = req.body;

    if (!fileName || !mimeType) {
      throw new AppError("fileName and mimeType are required", 400);
    }

    const detectedMime = mime.lookup(fileName);
    if (detectedMime !== mimeType) {
      throw new AppError("File extension does not match MIME type", 400);
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new AppError(
        "Invalid file type. Only JPG, PNG, and WEBP allowed",
        400
      );
    }

    const folder = `users/${userId}/profile-images`;
    const { uploadUrl, fileUrl } = await this.s3Service.generatePresignedUrl(
      folder,
      fileName,
      mimeType
    );

    return sendSuccess({
      res,
      message: "Presigned URL generated successfully.",
      data: { uploadUrl, fileUrl },
    });
  };

  deleteProfileImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const userId = req.user?.id;

    const user = await this.UserModel.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (!user.profileImage)
      throw new AppError("User has no profile image to delete", 400);

    await this.s3Service.deleteFile(user.profileImage);
    user.profileImage = undefined;
    await user.save();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Profile image deleted successfully",
    });
  };

  coverImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const userId = req.user?.id;

    if (!req.file) {
      throw new AppError("No image file uploaded", 400);
    }

    const user = await this.UserModel.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.coverImage) {
      await this.s3Service.deleteFile(user.coverImage);
    }

    const newKey = await this.s3Service.uploadFile(
      req.file,
      `users/${userId}/cover-images`
    );

    const updatedUser = await this.UserModel.updateCoverImage(userId, newKey);

    const userData = await updatedUser!.getSignedUserData();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Cover image uploaded successfully.",
      data: {
        user: userData,
      },
    });
  };

  deleteCoverImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const userId = req.user?.id;

    const user = await this.UserModel.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (!user.coverImage)
      throw new AppError("User has no cover image to delete", 400);

    await this.s3Service.deleteFile(user.coverImage);
    user.coverImage = undefined;
    await user.save();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Cover image deleted successfully",
    });
  };
}
