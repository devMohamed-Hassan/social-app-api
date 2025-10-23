import z from "zod";

import {
  ageValidator,
  emailValidator,
  firstNameValidator,
  lastNameValidator,
  otpValidator,
  passwordValidator,
  phoneValidator,
} from "../../common/validators";
import { Gender } from "../../models/user.model";

export const signupSchema = {
  body: z
    .object({
      firstName: firstNameValidator,
      lastName: lastNameValidator,
      email: emailValidator,
      age: ageValidator,
      phone: phoneValidator,
      gender: z.enum([Gender.Male, Gender.Female]),
      password: passwordValidator,
      rePassword: z.string().trim(),
    })
    .refine((data) => data.password === data.rePassword, {
      message: "Passwords do not match",
      path: ["rePassword"],
    }),
};

export const confirmEmailSchema = {
  body: z.object({
    email: emailValidator,
    otp: otpValidator,
  }),
};

export const resendEmailOTPSchema = {
  body: z.object({
    email: emailValidator,
  }),
};

export const loginSchema = {
  body: z.object({
    email: emailValidator,
    password: passwordValidator,
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: emailValidator,
  }),
};

export const resetPasswordSechma = {
  body: z.object({
    email: emailValidator,
    password: passwordValidator,
    otp: otpValidator,
  }),
};

export const updatePasswordSchema = {
  body: z
    .object({
      oldPassword: z
        .string()
        .nonempty("Old password is required")
        .min(8, { message: "Old password must be at least 8 characters" })
        .max(64, { message: "Old password must not exceed 64 characters" }),

      newPassword: z
        .string()
        .nonempty("New password is required")
        .min(8, { message: "Password must be at least 8 characters" })
        .max(64, { message: "Password must not exceed 64 characters" })
        .regex(/[A-Z]/, {
          message: "Password must contain at least one uppercase letter",
        })
        .regex(/[0-9]/, {
          message: "Password must contain at least one number",
        })
        .regex(/[@$!%*?&]/, {
          message: "Password must contain at least one special character",
        }),

      rePassword: z
        .string()
        .nonempty("Please confirm your new password")
        .min(8, { message: "Password must be at least 8 characters" }),
    })

    .refine((data) => data.newPassword === data.rePassword, {
      message: "Passwords do not match",
      path: ["rePassword"],
    })

    .refine((data) => data.oldPassword !== data.newPassword, {
      message: "New password cannot be the same as the old password",
      path: ["newPassword"],
    }),
};

export const updateEmailSchema = {
  body: z.object({
    newEmail: z.email({ message: "Please provide a valid email address" }),

    password: z
      .string({ message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .max(64, { message: "Password must not exceed 64 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one number",
      })
      .regex(/[@$!%*?&]/, {
        message: "Password must contain at least one special character",
      }),
  }),
};

export const confirmEmailUpdateSchema = {
  body: z.object({
    otp: otpValidator,
  }),
};

export const confirmEnable2FASchema = {
  body: z.object({
    otp: otpValidator,
  }),
};

export const Login2FASchema = {
  body: z.object({
    email: emailValidator,
    otp: otpValidator,
  }),
};

export const confirmDisable2FASchema = {
  body: z.object({
    otp: otpValidator,
  }),
};
