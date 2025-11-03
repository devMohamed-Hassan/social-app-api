import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { UserRepository } from "../../repositories/user.repository";
import { ChatRepository } from "../../repositories/chat.repository";
import { sendSuccess } from "../../utils/sendSuccess";
import { ChatModel } from "../../models/chat.model";
import mongoose from "mongoose";

export interface IGroupChatServices {}

export class GroupChatServices implements IGroupChatServices {
  private userModel = new UserRepository();
  private chatModel = new ChatRepository();

  constructor() {}

  createGroupChat = async (req: Request, res: Response, next: NextFunction) => {
    const { groupName, participants } = req.body;
    const creatorId = req.user?._id as string;

    if (!groupName || !participants || participants.length < 2) {
      throw new AppError(
        "A group must have at least 3 members (including you).",
        400
      );
    }

    const usersExist = await this.userModel.findManyByIds(participants);
    if (usersExist.length !== participants.length) {
      throw new AppError("One or more participants not found", 404);
    }

    const allMembers = [...new Set([...participants, creatorId])];

    const groupChat = await this.chatModel.create({
      participants: allMembers,
      isGroup: true,
      groupName,
    });

    const populatedChat = await ChatModel.findById(String(groupChat._id))
      .populate("participants", "firstName lastName profileImage _id")
      .lean();

    return sendSuccess({
      res,
      statusCode: 201,
      message: "Group chat created successfully",
      data: { chat: populatedChat },
    });
  };

  getAllGroupChats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.user?._id as string;

    const chats = await ChatModel.find({
      isGroup: true,
      participants: userId,
    })
      .populate("participants", "firstName lastName profileImage _id")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .lean();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Group chats retrieved successfully",
      data: { chats },
    });
  };

  getGroupChatById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { groupId } = req.params;
    const userId = req.user?._id;

    const chat = await ChatModel.findOne({
      _id: groupId,
      isGroup: true,
      participants: userId,
    })
      .populate("participants", "firstName lastName profileImage _id")
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "_id firstName lastName profileImage",
        },
      })
      .lean();

    if (!chat) throw new AppError("Group not found or access denied", 404);

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Group chat retrieved successfully",
      data: { chat },
    });
  };

  addMemberToGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { groupId } = req.params;
    const { userIdToAdd } = req.body;
    const userId = req.user?._id as string;

    const chat = await ChatModel.findOne({
      _id: groupId,
      isGroup: true,
      participants: userId,
    });
    if (!chat) throw new AppError("Group not found or access denied", 404);

    if (chat.participants.some((id) => id.toString() === userIdToAdd)) {
      throw new AppError("User already in group", 400);
    }

    chat.participants.push(new mongoose.Types.ObjectId(userIdToAdd));
    await chat.save();

    const updatedChat = await ChatModel.findById(groupId)
      .populate("participants", "firstName lastName profileImage _id")
      .lean();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "User added successfully",
      data: { chat: updatedChat },
    });
  };

  removeMemberFromGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { groupId } = req.params;
    const { userIdToRemove } = req.body;
    const userId = req.user?._id as string;

    const chat = await ChatModel.findOne({
      _id: groupId,
      isGroup: true,
      participants: userId,
    });
    if (!chat) throw new AppError("Group not found or access denied", 404);

    const isMember = chat.participants.some(
      (id) => id.toString() === userIdToRemove
    );
    
    if (!isMember) {
      throw new AppError("User not in group", 400);
    }

    chat.participants = chat.participants.filter(
      (id) => id.toString() !== userIdToRemove
    );
    await chat.save();

    const updatedChat = await ChatModel.findById(groupId)
      .populate("participants", "firstName lastName profileImage _id")
      .lean();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "User removed successfully",
      data: { chat: updatedChat },
    });
  };

  renameGroupChat = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const { newName } = req.body;
    const userId = req.user?._id as string;

    if (!newName || !newName.trim()) {
      throw new AppError("New group name is required", 400);
    }

    const chat = await ChatModel.findOne({
      _id: groupId,
      isGroup: true,
      participants: userId,
    });

    if (!chat) throw new AppError("Group not found or access denied", 404);

    chat.groupName = newName.trim();
    await chat.save();

    const updatedChat = await ChatModel.findById(groupId)
      .populate("participants", "firstName lastName profileImage _id")
      .lean();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Group name updated successfully",
      data: { chat: updatedChat },
    });
  };
}
