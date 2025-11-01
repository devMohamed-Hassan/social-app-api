import { model, Schema, Types, Document } from "mongoose";

export interface IChat extends Document {
  participants: Types.ObjectId[];
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  lastMessage?: Types.ObjectId;
  messages: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true,
    },
    groupImage: {
      type: String,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_: any, ret: Record<string, any>) => {
        ret.id = ret._id;
        if ("_id" in ret) delete ret._id;
        if ("__v" in ret) delete ret.__v;
        return ret;
      },
    },
  }
);

export const ChatModel = model<IChat>("Chat", ChatSchema);
