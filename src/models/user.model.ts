import { model, Schema, Document } from "mongoose";
import OtpSchema from "./otp.model";
import { IOtp } from "../types/otp.types";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  age?: number;
  profileImage?: string | undefined;
  coverImage?: string | undefined;
  emailOtp?: IOtp | undefined;
  passwordOtp?: IOtp | undefined;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, unique: true, sparse: true },
    age: { type: Number, min: 18, max: 100 },
    profileImage: { type: String },
    coverImage: { type: String },
    isVerified: { type: Boolean, default: false },
    emailOtp: OtpSchema,
    passwordOtp: OtpSchema,
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", UserSchema);
