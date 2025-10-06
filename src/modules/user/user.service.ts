import { S3Service } from "./../../services/s3.service";
import { StoreIn } from "./../../services/multer/multer.config";
import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/sendSuccess";
import { AppError } from "../../utils/AppError";

export interface IUserServices {
  profileImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
}

export class UserServices implements IUserServices {
  constructor() {}
  profileImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    //console.log({ file: req.file });

    if (!req.file) {
      throw new AppError("No image file uploaded", 400);
    }

    const imageUrl = await S3Service.uploadFile({
      path: "profiles",
      file: req.file,
      storeIn: StoreIn.MEMORY,
    });

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Profile image uploaded successfully.",
      data: {
        imageUrl,
      },
    });
  };
}
