import { model, Schema, Document, Types } from "mongoose";
import OtpSchema from "./otp.model";
import { IOtp } from "../types/otp.types";
import { HashUtil } from "../utils/hash/bcrypt.util";
import { CryptoUtil } from "../utils/hash/crypto.util";
import { S3Service } from "../services/s3.service";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  pendingEmail: string;
  password: string;
  phone: string;
  age: number;
  profileImage?: string | undefined;
  coverImage?: string | undefined;
  emailOtp?: IOtp | undefined;
  passwordOtp?: IOtp | undefined;
  emailChangeOtp?: IOtp | undefined;
  isVerified: boolean;
  friends: Types.ObjectId[];
  friendRequests: {
    from: Types.ObjectId;
    to: Types.ObjectId;
    status: "pending" | "accepted" | "rejected";
  }[];
  credentialChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(plainText: string): Promise<boolean>;
  getSignedUserData(): Promise<Record<string, any>>;
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
    pendingEmail: {
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
    emailChangeOtp: OtpSchema,
    friends: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    friendRequests: [
      {
        from: { type: Schema.Types.ObjectId, ref: "User" },
        to: { type: Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],
    credentialChangedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_: any, ret: Record<string, any>) => {
        delete ret.password;
        delete ret.__v;
        delete ret.emailOtp;
        delete ret.passwordOtp;

        if (ret.phone) {
          try {
            ret.phone = CryptoUtil.decrypt(ret.phone);
          } catch {}
        }

        ret.id = ret._id;
        delete ret._id;

        return ret;
      },
    },
  }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await HashUtil.hash(this.password);
  }

  if (this.isModified("phone") && this.phone) {
    this.phone = CryptoUtil.encrypt(this.phone);
  }

  next();
});

UserSchema.methods.getSignedUserData = async function () {
  const s3Service = new S3Service();
  const expiresInSeconds = 3600;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + expiresInSeconds;

  const profileImage = this.profileImage
    ? {
        url: await s3Service.getSignedUrl(this.profileImage),
        expiresIn: expiresInSeconds,
        expiresAt,
      }
    : undefined;

  const coverImage = this.coverImage
    ? {
        url: await s3Service.getSignedUrl(this.coverImage),
        expiresIn: expiresInSeconds,
        expiresAt,
      }
    : undefined;

  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: CryptoUtil.decrypt(this.phone),
    age: this.age,
    isVerified: this.isVerified,
    profileImage,
    coverImage,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

UserSchema.methods.comparePassword = async function (plainText: string) {
  return await HashUtil.compare(plainText, this.password);
};

export const UserModel = model<IUser>("User", UserSchema);
