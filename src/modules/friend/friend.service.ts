import { NextFunction, Request, Response } from "express";
import { UserRepository } from "../../repositories/user.repository";
import { sendSuccess } from "../../utils/sendSuccess";
import { Types } from "mongoose";
import { FriendRequestStatus, IUser } from "../../models/user.model";
import { AppError } from "../../utils/AppError";

export interface IFriendServices {
  sendRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  acceptRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  rejectRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  cancelRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  getFriends(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
  getPendingRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response>;
}

export class FriendService implements IFriendServices {
  private userRepository = new UserRepository();

  constructor() {}

  sendRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const fromId = req.user._id as Types.ObjectId;
    const { id: toUserId } = req.params;

    if (!toUserId) throw new AppError("Missing target user ID", 400);
    if (fromId.toString() === toUserId)
      throw new AppError("You cannot send a request to yourself", 400);

    const fromUser = await this.userRepository.findById(fromId.toString());
    const toUser = await this.userRepository.findById(toUserId);

    if (!toUser) throw new AppError("User not found", 404);

    const isBlocked = await this.userRepository.isUserBlocked(toUserId, fromId.toString());
    if (isBlocked) {
      throw new AppError("You cannot send a friend request to this user", 403);
    }

    const hasBlockedTarget = await this.userRepository.isUserBlocked(fromId.toString(), toUserId);
    if (hasBlockedTarget) {
      throw new AppError("You cannot send a friend request to a user you have blocked", 403);
    }

    const toUserObjectId = toUser._id as Types.ObjectId;

    if (
      fromUser?.friends.some(
        (id) => id.toString() === toUserObjectId.toString()
      )
    ) {
      throw new AppError("Already friends", 400);
    }

    const existing = toUser.friendRequests.find(
      (r) =>
        r.from.toString() === fromId.toString() &&
        r.status === FriendRequestStatus.Pending
    );

    if (existing) throw new AppError("Friend request already sent", 400);

    toUser.friendRequests.push({
      from: fromId,
      to: toUserObjectId,
      status: FriendRequestStatus.Pending,
    });
    await toUser.save();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Friend request sent successfully",
      data: {
        from: {
          id: fromUser?._id,
          firstName: fromUser?.firstName,
          lastName: fromUser?.lastName,
        },
        to: {
          id: toUserObjectId,
          firstName: toUser.firstName,
          lastName: toUser.lastName,
        },
      },
    });
  };

  acceptRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const toId = req.user._id as Types.ObjectId;
    const { id: fromUserId } = req.params;

    if (!fromUserId) throw new AppError("Missing fromUserId", 400);

    const toUser = await this.userRepository.findById(toId.toString());
    const fromUser = await this.userRepository.findById(fromUserId);

    if (!toUser || !fromUser) throw new AppError("User not found", 404);


    const isFromUserBlocked = await this.userRepository.isUserBlocked(toId.toString(), fromUserId);
    const isToUserBlocked = await this.userRepository.isUserBlocked(fromUserId, toId.toString());
    
    if (isFromUserBlocked || isToUserBlocked) {
      throw new AppError("Cannot accept friend request due to blocking", 403);
    }

    const fromObjectId = fromUser._id as Types.ObjectId;
    const toObjectId = toUser._id as Types.ObjectId;

    const requestIndex = toUser.friendRequests.findIndex(
      (r) =>
        r.from.toString() === fromUserId &&
        r.status === FriendRequestStatus.Pending
    );

    if (requestIndex === -1) {
      throw new AppError("Friend request not found or already handled", 400);
    }

    if (!toUser.friends.some((f) => f.toString() === fromObjectId.toString())) {
      toUser.friends.push(fromObjectId);
    }

    if (!fromUser.friends.some((f) => f.toString() === toObjectId.toString())) {
      fromUser.friends.push(toObjectId);
    }

    toUser.friendRequests.splice(requestIndex, 1);

    await Promise.all([toUser.save(), fromUser.save()]);

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Friend request has been accepted successfully.",
    });
  };

  rejectRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const toId = req.user._id as Types.ObjectId;
    const { id: fromUserId } = req.params;

    if (!fromUserId) throw new AppError("Missing fromUserId", 400);

    const toUser = await this.userRepository.findById(toId.toString());
    if (!toUser) throw new AppError("User not found", 404);

    const requestIndex = toUser.friendRequests.findIndex(
      (r) =>
        r.from.toString() === fromUserId &&
        r.status === FriendRequestStatus.Pending
    );

    if (requestIndex === -1) {
      throw new AppError("Friend request not found or already handled", 400);
    }

    toUser.friendRequests.splice(requestIndex, 1);
    await toUser.save();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Friend request has been rejected successfully.",
    });
  };

  cancelRequest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const fromId = req.user._id as Types.ObjectId;
    const { id: toUserId } = req.params;

    if (!toUserId) throw new AppError("Missing target user ID", 400);

    const toUser = await this.userRepository.findById(toUserId);
    if (!toUser) throw new AppError("User not found", 404);

    const requestIndex = toUser.friendRequests.findIndex(
      (r) =>
        r.from.toString() === fromId.toString() &&
        r.status === FriendRequestStatus.Pending
    );

    if (requestIndex === -1) {
      throw new AppError("Friend request not found or already handled", 400);
    }

    toUser.friendRequests.splice(requestIndex, 1);
    await toUser.save();

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Friend request has been cancelled successfully.",
    });
  };

  getFriends = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const userId = req.user._id as Types.ObjectId;
    const { page = 1, limit = 10 } = req.query as any;
    
    const pageNum = parseInt(page.toString(), 10);
    const limitNum = parseInt(limit.toString(), 10);

    const user = await this.userRepository.findById(userId.toString());
    if (!user) throw new AppError("User not found", 404);

    const friendIds = user.friends.map((id) => id.toString());
    
    if (friendIds.length === 0) {
      return sendSuccess({
        res,
        statusCode: 200,
        message: "Friends retrieved successfully",
        data: {
          friends: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            pages: 0,
          },
        },
      });
    }

    const skip = (pageNum - 1) * limitNum;
    const friends = await this.userRepository.findAll(
      { _id: { $in: friendIds } },
      undefined,
      { skip, limit: limitNum }
    );

    const friendsData = await Promise.all(
      friends.map(async (friend) => {
        const userData = await friend.getSignedUserData();
        return {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          profileImage: userData.profileImage,
          friendsSince: friend.updatedAt,
        };
      })
    );

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Friends retrieved successfully",
      data: {
        friends: friendsData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: friendIds.length,
          pages: Math.ceil(friendIds.length / limitNum),
        },
      },
    });
  };

  getPendingRequests = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const userId = req.user._id as Types.ObjectId;
    const { page = 1, limit = 10 } = req.query as any;
    
    const pageNum = parseInt(page.toString(), 10);
    const limitNum = parseInt(limit.toString(), 10);

    const user = await this.userRepository.findById(userId.toString());
    if (!user) throw new AppError("User not found", 404);

    const pendingRequests = user.friendRequests.filter(
      (req) => req.status === FriendRequestStatus.Pending
    );

    if (pendingRequests.length === 0) {
      return sendSuccess({
        res,
        statusCode: 200,
        message: "Pending requests retrieved successfully",
        data: {
          requests: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            pages: 0,
          },
        },
      });
    }

    const skip = (pageNum - 1) * limitNum;
    const requestSenders = await this.userRepository.findAll(
      { _id: { $in: pendingRequests.map((req) => req.from) } },
      undefined,
      { skip, limit: limitNum }
    );

    const requestsData = await Promise.all(
      requestSenders.map(async (sender) => {
        const userData = await sender.getSignedUserData();
        const request = pendingRequests.find(
          (req) => req.from.toString() === (sender._id as any).toString()
        );
        
        return {
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          profileImage: userData.profileImage,
          requestId: request?.from.toString(),
          sentAt: sender.createdAt,
        };
      })
    );

    return sendSuccess({
      res,
      statusCode: 200,
      message: "Pending requests retrieved successfully",
      data: {
        requests: requestsData,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: pendingRequests.length,
          pages: Math.ceil(pendingRequests.length / limitNum),
        },
      },
    });
  };
}
