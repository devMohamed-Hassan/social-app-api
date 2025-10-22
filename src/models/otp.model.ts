import { Schema } from "mongoose";
import { HashUtil } from "../utils/hash/bcrypt.util";

export interface IOtp {
  code: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  maxAttempts: number;

  compareOtp?(plainOtp: string): Promise<boolean>;
}

const OtpSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
  },
  { _id: false }
);

OtpSchema.pre("save", async function (next) {
  if (this.isModified("code")) {
    this.code = await HashUtil.hash(this.code);
  }
  next();
});

OtpSchema.methods.compareOtp = async function (plainOtp: string) {
  return await HashUtil.compare(plainOtp, this.code);
};

export default OtpSchema;
