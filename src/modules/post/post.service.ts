import { S3Service } from "../../services/s3.service";
import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/sendSuccess";
import { creatPostDTO, reactToPostDTO } from "./post.dto";
import { UserRepository } from "../../repositories/user.repository";
import { PostRepository } from "../../repositories/post.repository";
import { AppError } from "../../utils/AppError";
import mongoose, { Types } from "mongoose";
import { success } from "zod";

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
    const { content, privacy, tags }: creatPostDTO = req.body;
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

  getAllPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const user = req.user;
    if (!user?._id) throw new AppError("Unauthorized", 401);

    const userData = await this.UserModel.findById(user._id as string);
    const friendIds = userData?.friends?.map((f: any) => String(f._id)) || [];

    const posts = await this.PostModel.getAllPosts(
      user._id as string,
      friendIds
    );

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Posts retrieved successfully",
      data: {
        posts,
      },
    });
  };

  reactToPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { type }: reactToPostDTO = req.body;
    const postId = req.params.id;
    const user = req.user;

    if (!postId) throw new AppError("Post ID is required", 400);
    if (!user?._id) throw new AppError("Unauthorized", 401);

    const userId = new mongoose.Types.ObjectId(user._id as string);

    const updatedPost = await this.PostModel.toggleReaction(
      postId,
      userId,
      type
    );

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Reaction updated successfully",
      data: updatedPost,
    });
  };

  getPostById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { id } = req.params;

    if (!id) throw new AppError("Post ID is required", 400);

    const post = await this.PostModel.getPostById(id);

    if (!post) throw new AppError("Post not found", 404);

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Post fetched successfully",
      data: post,
    });
  };
}
