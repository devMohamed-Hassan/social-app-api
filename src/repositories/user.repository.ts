import {
  HydratedDocument,
  Model,
  ProjectionFields,
  QueryOptions,
} from "mongoose";
import { IUser, UserModel } from "../models/user.model";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<IUser> {
  constructor(protected override readonly model: Model<IUser> = UserModel) {
    super(model);
  }

  async findByEmail(
    email: string,
    projection?: ProjectionFields<IUser>,
    options?: QueryOptions
  ): Promise<HydratedDocument<IUser> | null> {
    return this.model.findOne({ email }, projection, options);
  }

  async findByEmailWithPassword(
    email: string,
    projection?: ProjectionFields<IUser>,
    options?: QueryOptions
  ): Promise<HydratedDocument<IUser> | null> {
    return this.model
      .findOne({ email }, projection, options)
      .select("+password");
  }

  async findByIdWithPassword(
    userId: string,
    projection?: ProjectionFields<IUser>,
    options?: QueryOptions
  ): Promise<HydratedDocument<IUser> | null> {
    return this.model.findById(userId, projection, options).select("+password");
  }

  async findManyByIds(ids: string[]) {
    return this.model.find({ _id: { $in: ids } });
  }

  async updateProfileImage(
    userId: string,
    imageUrl: string
  ): Promise<HydratedDocument<IUser> | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true, select: "-password" }
    );
  }

  async updateCoverImage(
    userId: string,
    imageUrl: string
  ): Promise<HydratedDocument<IUser> | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { coverImage: imageUrl },
      { new: true, select: "-password" }
    );
  }

  async blockUser(
    userId: string,
    blockedUserId: string
  ): Promise<HydratedDocument<IUser> | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $addToSet: { blockedUsers: blockedUserId } },
      { new: true, select: "-password" }
    );
  }

  async unblockUser(
    userId: string,
    blockedUserId: string
  ): Promise<HydratedDocument<IUser> | null> {
    return this.model.findByIdAndUpdate(
      userId,
      { $pull: { blockedUsers: blockedUserId } },
      { new: true, select: "-password" }
    );
  }

  async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const user = await this.model.findById(userId, { blockedUsers: 1 });
    if (!user) return false;

    return user.blockedUsers.some(
      (blockedId) => blockedId.toString() === targetUserId
    );
  }

  async getBlockedUsers(
    userId: string,
    projection?: ProjectionFields<IUser>,
    options?: QueryOptions
  ): Promise<HydratedDocument<IUser>[]> {
    const user = await this.model.findById(userId, { blockedUsers: 1 });
    if (!user || user.blockedUsers.length === 0) return [];

    return this.model.find(
      { _id: { $in: user.blockedUsers } },
      projection,
      options
    );
  }

  async getUsersWhoBlockedMe(userId: string): Promise<string[]> {
    const users = await this.model.find({ blockedUsers: userId }, { _id: 1 });

    return users.map((user) => user._id as string);
  }

  async removeFriendship(userId1: string, userId2: string): Promise<void> {
    await this.model.findByIdAndUpdate(userId1, {
      $pull: { friends: userId2 },
    });

    await this.model.findByIdAndUpdate(userId2, {
      $pull: { friends: userId1 },
    });
  }
}
