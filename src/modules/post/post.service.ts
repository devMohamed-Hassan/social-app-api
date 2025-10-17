import { S3Service } from "../../services/s3.service";
import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/sendSuccess";
import { creatPostDto } from "./post.dto";
import { UserRepository } from "../../repositories/user.repository";
import { PostRepository } from "../../repositories/post.repository";
import { AppError } from "../../utils/AppError";
import mongoose, { Types } from "mongoose";

export interface IPostServices {
  createPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
}

export class PostServices implements IPostServices {
  private UserModel = new UserRepository();
  private PostModel = new PostRepository();
  private S3Service = new S3Service();

  createPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { content, privacy, tags }: creatPostDto = req.body;
    const images = req.files as Express.Multer.File[] | undefined;
    const user = req.user;

    if (!user?._id) {
      throw new AppError("Unauthorized", 401);
    }

    let validTagIds: mongoose.Types.ObjectId[] = [];

    if (Array.isArray(tags) && tags.length > 0) {
      const filteredTags = tags.filter(
        (tagId) => String(tagId) !== String(user._id)
      );

      if (filteredTags.length !== tags.length) {
        throw new AppError("You cannot tag yourself", 400);
      }

      const taggedUsers = await this.UserModel.findAll({
        _id: { $in: filteredTags },
      });

      validTagIds = taggedUsers.map(
        (u: any) => new Types.ObjectId(String(u._id))
      );

      if (validTagIds.length !== filteredTags.length) {
        throw new AppError("Some tagged users do not exist", 400);
      }
    }

    let uploadedImageKeys: string[] = [];

    if (images && images.length > 0) {
      uploadedImageKeys = await this.S3Service.uploadFiles(
        images,
        `users/${String(user._id)}/posts`
      );
    }

    const newPost = await this.PostModel.createPost({
      author: new mongoose.Types.ObjectId(String(user._id)),
      content: content || "",
      privacy: privacy || "public",
      tags: validTagIds,
      images: uploadedImageKeys,
      isEdited: false,
    });

    return sendSuccess({
      res,
      statusCode: 201,
      message: "Post created successfully",
      data: newPost,
    });
  };
}
