import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/sendSuccess";
import { UserRepository } from "../../repositories/user.repository";
import { ChatRepository } from "../../repositories/chat.repository";

export class ChatServices {
  private userModel = new UserRepository();
  private chatModel = new ChatRepository();

  constructor() {}

  getChat = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    const userId = req.user?._id as string;
    const { id: receiverId } = req.params;

    if (!receiverId) throw new AppError("Receiver ID is required", 400);

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    const user = await this.userModel.findOne({
      _id: userObjectId,
      friends: {
        $in: [receiverObjectId, receiverId],
      },
    });

    if (!user) {
      throw new AppError("You can only chat with your friends", 403);
    }

    let chat = await this.chatModel.findPrivateConversation(userId, receiverId);

    if (!chat) {
      chat = await this.chatModel.createPrivateConversation(userId, receiverId);
      const populatedChat = await chat.populate(
        "participants",
        "firstName lastName profileImage"
      );
      return sendSuccess({
        res,
        statusCode: 200,
        message: "New chat created successfully",
        data: { chat: populatedChat },
      });
    }

    const populatedChat = await chat.populate(
      "participants",
      "firstName lastName profileImage"
    );

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Chat retrieved successfully",
      data: { chat: populatedChat },
    });
  };
}
