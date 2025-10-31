import { Model, Types } from "mongoose";
import { ChatModel, IChat } from "../models/chat.model";
import { BaseRepository } from "./base.repository";

export class ChatRepository extends BaseRepository<IChat> {
  constructor(protected override readonly model: Model<IChat> = ChatModel) {
    super(model);
  }

  async findPrivateConversation(userId1: string, userId2: string) {
    const userObjectId1 = new Types.ObjectId(userId1);
    const userObjectId2 = new Types.ObjectId(userId2);

    return this.model.findOne({
      isGroup: false,
      participants: { $all: [userObjectId1, userObjectId2] },
    });
  }

  async createPrivateConversation(userId1: string, userId2: string) {
    const userObjectId1 = new Types.ObjectId(userId1);
    const userObjectId2 = new Types.ObjectId(userId2);

    const conversation = await this.model.create({
      participants: [userObjectId1, userObjectId2],
      isGroup: false,
    });

    return conversation.populate(
      "participants",
      "firstName lastName profileImage"
    );
  }
}
