import {
  HydratedDocument,
  Model,
  ProjectionFields,
  QueryOptions,
} from "mongoose";
import { IUser, UserModel } from "../models/user.model";
import { BaseRepository } from "./db.repository";

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
}
