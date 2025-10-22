import mongoose, { Model, Types } from "mongoose";
import { IPost, PostModel } from "../models/post.model";
import { BaseRepository } from "./base.repository";

export class PostRepository extends BaseRepository<IPost> {
  constructor(protected override readonly model: Model<IPost> = PostModel) {
    super(model);
  }

  async createPost(data: Partial<IPost>) {
    return await this.model.create(data);
  }

  async getAllPosts(
    currentUserId: string,
    friendIds: string[] = [],
    filter: Partial<IPost> = {}
  ) {
    const userObjectId = new Types.ObjectId(currentUserId);

    const privacyFilter: mongoose.FilterQuery<IPost> = {
      $or: [
        { privacy: "public" },
        { author: userObjectId },
        { $and: [{ privacy: "friends" }, { author: { $in: friendIds } }] },
      ],
    };

    const finalFilter: mongoose.FilterQuery<IPost> = {
      ...filter,
      ...privacyFilter,
    };

    return await this.model
      .find(finalFilter)
      .populate([
        { path: "author", select: "firstName lastName profileImage" },
        { path: "tags", select: "firstName lastName profileImage" },
      ])
      .sort({ createdAt: -1 });
  }

  async getPostById(postId: string | Types.ObjectId) {
    return await this.model.findById(postId).populate([
      { path: "author", select: "firstName lastName profileImage" },
      { path: "tags", select: "firstName lastName profileImage" },
      { path: "comments.userId", select: "firstName lastName profileImage" },
      {
        path: "comments.replies.userId",
        select: "firstName lastName profileImage",
      },
    ]);
  }

  async updatePost(postId: string, data: Partial<IPost>) {
    return await this.model.findByIdAndUpdate(
      postId,
      { ...data, isEdited: true },
      { new: true }
    );
  }

  async deletePost(postId: string) {
    return await this.model.findByIdAndDelete(postId);
  }

  async toggleReaction(postId: string, userId: Types.ObjectId, type: string) {
    const post = await this.model.findById(postId);
    if (!post) return null;

    if (!post.reactions) post.reactions = [];

    const existing = post.reactions.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existing) {
      if (existing.type === type) {
        post.reactions = post.reactions.filter(
          (r) => r.userId.toString() !== userId.toString()
        );
      } else {
        existing.type = type as any;
      }
    } else {
      post.reactions.push({ userId, type } as any);
    }

    await post.save();
    return post;
  }

  async addComment(postId: string, userId: Types.ObjectId, text: string) {
    const post = await this.model.findById(postId);
    if (!post) return null;

    post.comments?.push({ userId, text });
    await post.save();
    return post;
  }

  async addReply(
    postId: string,
    commentIndex: number,
    userId: Types.ObjectId,
    text: string
  ) {
    const post = await this.model.findById(postId);
    if (!post || !post.comments || !post.comments[commentIndex]) return null;

    post.comments[commentIndex].replies?.push({ userId, text });
    await post.save();
    return post;
  }

  async toggleFreeze(postId: string, freeze: boolean) {
    return await this.model.findByIdAndUpdate(
      postId,
      { isFrozen: freeze },
      { new: true }
    );
  }
}
