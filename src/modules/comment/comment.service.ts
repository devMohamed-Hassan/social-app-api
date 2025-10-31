import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../../utils/sendSuccess";
import { PostRepository } from "../../repositories/post.repository";
import { UserRepository } from "../../repositories/user.repository";
import { AppError } from "../../utils/AppError";
import { Types } from "mongoose";

export interface ICommentServices {
  getCommentsByPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;

  addComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
}

export class CommentServices implements ICommentServices {
  private postRepository = new PostRepository();

  constructor() {}

  getCommentsByPost = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { id: postId } = req.params;
    console.log(postId);

    const post = await this.postRepository.getPostById(postId as string);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Comments fetched successfully",
      data: post.comments || [],
    });
  };

  addComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { id: postId } = req.params;
    const { text } = req.body;
    const userId = new Types.ObjectId(req.user?.id as string);

    if (!postId) {
      throw new AppError("Post ID is required", 400);
    }

    const updatedPost = await this.postRepository.addComment(
      postId,
      userId,
      text
    );

    if (!updatedPost) {
      throw new AppError("Post not found", 404);
    }

    return sendSuccess({
      res,
      statusCode: 201,
      message: "Comment added successfully",
      data: updatedPost.comments?.[updatedPost.comments.length - 1],
    });
  };

  addReply = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { id: postId, commentIndex } = req.params;
    const { text } = req.body;

    if (!postId) throw new AppError("Post ID is required", 400);
    if (!req.user?.id) throw new AppError("User not authenticated", 401);

    const userId = req.user.id;

    const updatedPost = await this.postRepository.addReply(
      postId,
      Number(commentIndex),
      userId,
      text
    );

    if (!updatedPost) throw new AppError("Comment not found", 404);

    const replies = updatedPost.comments?.[Number(commentIndex)]?.replies || [];

    const newReply = replies[replies.length - 1];

    if (!newReply) {
      throw new AppError("Reply not created", 500);
    }

    return sendSuccess({
      res,
      statusCode: 201,
      message: "Reply added successfully",
      data: newReply,
    });
  };

  deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const { id: postId, commentIndex } = req.params;

    const post = await this.postRepository.getPostById(postId as string);
    if (!post) throw new AppError("Post not found", 404);

    const index = Number(commentIndex);

    if (!post.comments || !post.comments[index])
      throw new AppError("Comment not found", 404);

    if (post.comments[index].userId._id.toString() !== req.user?.id)
      throw new AppError("You can only delete your own comment", 403);

    post.comments.splice(index, 1);
    await post.save();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Comment deleted successfully",
      data: {},
    });
  };

  updateComment = async (req: Request, res: Response): Promise<Response> => {
    const { id: postId, commentIndex } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;

    const post = await this.postRepository.getPostById(postId as string);
    if (!post) throw new AppError("Post not found", 404);

    const comment = post.comments?.[Number(commentIndex)];
    if (!comment) throw new AppError("Comment not found", 404);

    if (comment.userId._id.toString() !== userId)
      throw new AppError("You can only update your own comment", 403);

    comment.text = text;
    await post.save();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Comment updated successfully",
      data: comment,
    });
  };

  deleteReply = async (req: Request, res: Response): Promise<Response> => {
    const { id: postId, commentIndex, replyIndex } = req.params;
    const userId = req.user?.id;

    const post = await this.postRepository.getPostById(postId as string);
    if (!post) throw new AppError("Post not found", 404);

    const comment = post.comments?.[Number(commentIndex)];
    if (!comment) throw new AppError("Comment not found", 404);

    const reply = comment.replies?.[Number(replyIndex)];
    if (!reply) throw new AppError("Reply not found", 404);

    if (reply.userId._id.toString() !== userId)
      throw new AppError("You can only delete your own reply", 403);

    comment.replies?.splice(Number(replyIndex), 1);
    await post.save();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Reply deleted successfully",
      data: {},
    });
  };

  updateReply = async (req: Request, res: Response): Promise<Response> => {
    const { id: postId, commentIndex, replyIndex } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;

    const post = await this.postRepository.getPostById(postId as string);
    if (!post) throw new AppError("Post not found", 404);

    const comment = post.comments?.[Number(commentIndex)];
    if (!comment) throw new AppError("Comment not found", 404);

    const reply = comment.replies?.[Number(replyIndex)];
    if (!reply) throw new AppError("Reply not found", 404);

    if (reply.userId._id.toString() !== userId)
      throw new AppError("You can only update your own reply", 403);

    reply.text = text;
    await post.save();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Reply updated successfully",
      data: reply,
    });
  };
}
