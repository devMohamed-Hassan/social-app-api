import { Types } from "mongoose";
import { z } from "zod";

export const firstNameValidator = z
  .string()
  .trim()
  .min(2, { message: "First name must be at least 2 characters long" })
  .max(30, { message: "First name must not exceed 30 characters" })
  .regex(/^[A-Za-z]+$/, { message: "First name must contain only letters" });

export const lastNameValidator = z
  .string()
  .trim()
  .min(2, { message: "Last name must be at least 2 characters long" })
  .max(30, { message: "Last name must not exceed 30 characters" })
  .regex(/^[A-Za-z]+$/, { message: "Last name must contain only letters" });

export const emailValidator = z
  .string()
  .trim()
  .email({ message: "Please enter a valid email address" })
  .max(100, { message: "Email must not exceed 100 characters" });

export const ageValidator = z
  .number()
  .int()
  .min(18, { message: "You must be at least 18 years old" })
  .max(100, { message: "Age must not exceed 100 years" });

export const phoneValidator = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, {
    message: "Phone number must be valid (10–15 digits, optional +)",
  });

export const passwordValidator = z
  .string()
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
  });

export const otpValidator = z
  .string()
  .trim()
  .regex(/^[0-9]{6}$/, {
    message: "OTP must be a 6-digit numeric code",
  });

export const objectIdValidator = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid user ID",
  });

export const file = z
  .object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string().refine((val) => val.startsWith("image/"), {
      message: "Only image files are allowed",
    }),
    size: z.number().max(5 * 1024 * 1024, "Image must be <= 5MB"),
    buffer: z.any().optional(),
  })
  .optional();

export const files = z
  .array(
    z.object({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string().refine((val) => val.startsWith("image/"), {
        message: "Only image files are allowed",
      }),
      size: z.number().max(5 * 1024 * 1024, "Each image must be <= 5MB"),
      buffer: z.any().optional(),
    })
  )
  .optional();
