import z from "zod";
import {
  confirmEmailSchema,
  forgotPasswordSchema,
  loginSchema,
  resendEmailOTPSchema,
  resetPasswordSechma,
  signupSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "./auth.validation";

export type SignupDTO = z.infer<typeof signupSchema.body>;

export type ConfirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;

export type LoginDTO = z.infer<typeof loginSchema.body>;

export type ResetPasswordDTO = z.infer<typeof resetPasswordSechma.body>;

export type ResendEmailOtpDTO = z.infer<typeof resendEmailOTPSchema.body>;

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema.body>;

export type UpdatePasswordDTO = z.infer<typeof updatePasswordSchema.body>;

export type UpdateEmailDTO = z.infer<typeof updateEmailSchema.body>;
