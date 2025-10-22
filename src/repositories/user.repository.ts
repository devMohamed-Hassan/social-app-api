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
}
