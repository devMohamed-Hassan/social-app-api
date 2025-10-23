import { model, Schema, Document, Types } from "mongoose";
import OtpSchema, { IOtp } from "./otp.model";
import { HashUtil } from "../utils/hash/bcrypt.util";
import { CryptoUtil } from "../utils/hash/crypto.util";
import { S3Service } from "../services/s3.service";

export enum FriendRequestStatus {
  Pending = "pending",
  Accepted = "accepted",
  Rejected = "rejected",
}

export enum Gender {
  Male = "male",
  Female = "female",
}

export interface IFriendRequest {
  from: Types.ObjectId;
  to: Types.ObjectId;
  status: FriendRequestStatus;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  pendingEmail: string | undefined;
  password: string;
  phone: string;
  age: number;
  gender: Gender;
  bio?: string;
  profileImage?: string | undefined;
  coverImage?: string | undefined;
  emailOtp?: IOtp | undefined;
  passwordOtp?: IOtp | undefined;
  updateEmailOtp?: IOtp | undefined;
  twoFactorOtp?: IOtp | undefined;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  friends: Types.ObjectId[];
  friendRequests: IFriendRequest[];
  blockedUsers: Types.ObjectId[];
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
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true, select: false },
    phone: { type: String, unique: true, sparse: true },
    age: { type: Number, min: 18, max: 100 },
    gender: {
      type: String,
      required: true,
      enum: Object.values(Gender),
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    profileImage: { type: String },
    coverImage: { type: String },
    isVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    emailOtp: OtpSchema,
    passwordOtp: OtpSchema,
    updateEmailOtp: OtpSchema,
    twoFactorOtp: OtpSchema,
    friends: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    friendRequests: [
      {
        from: { type: Schema.Types.ObjectId, ref: "User" },
        to: { type: Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: Object.values(FriendRequestStatus),
          default: FriendRequestStatus.Pending,
        },
      },
    ],
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
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

UserSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;

  if (update.phone) {
    update.phone = CryptoUtil.encrypt(update.phone);
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
    gender: this.gender,
    bio: this.bio || "",
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
