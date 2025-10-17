import { Document, model, Schema, Types } from "mongoose";

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface IReply {
  userId: Types.ObjectId;
  text: string;
  createdAt?: Date;
}

export interface IComment {
  userId: Types.ObjectId;
  text: string;
  replies?: IReply[];
  createdAt?: Date;
}

export interface IReaction {
  userId: Types.ObjectId;
  type: ReactionType;
}

export interface IPost extends Document {
  author: Types.ObjectId;
  content?: string;
  images?: string[];
  privacy: "public" | "friends" | "only_me";
  tags?: Types.ObjectId[];
  reactions?: IReaction[];
  comments?: IComment[];
  isEdited: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReplySchema = new Schema<IReply>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    replies: [ReplySchema],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const reactionTypes = ["like", "love", "haha", "wow", "sad", "angry"] as const;

const ReactionSchema = new Schema<IReaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: reactionTypes, required: true },
  },
  { _id: false }
);

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true, maxlength: 5000 },
    images: [{ type: String }],
    privacy: {
      type: String,
      enum: ["public", "friends", "only_me"],
      default: "public",
    },
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reactions: [ReactionSchema],
    comments: [CommentSchema],
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PostModel = model<IPost>("Post", PostSchema);
