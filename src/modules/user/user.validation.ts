import { z } from "zod";
import { objectIdValidator } from "../../common/validators";

export const updateUserInfoSchema = {
  body: z.object({
    firstName: z.string().min(1, "First name is required").trim().optional(),
    lastName: z.string().min(1, "Last name is required").trim().optional(),
    age: z
      .number()
      .min(18, "Age must be at least 18")
      .max(100, "Age must be at most 100")
      .optional(),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .optional(),
    gender: z
      .enum(["male", "female"])
      .optional()
      .refine(
        (val) => val === undefined || ["male", "female"].includes(val),
        "Invalid gender value. Must be 'male' or 'female'"
      ),
    bio: z
      .string()
      .trim()
      .max(300, "Bio must be at most 300 characters")
      .optional(),
  }),
};

export const blockUserSchema = {
  params: z.object({
    id: objectIdValidator,
  }),
};

export const unblockUserSchema = {
  params: z.object({
    id: objectIdValidator,
  }),
};

export const getBlockedUsersSchema = {
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
};

export const getUserByIdSchema = {
  params: z.object({
    id: objectIdValidator,
  }),
};

export const chatSchema = {
  params: z.object({
    id: objectIdValidator,
  }),
};
