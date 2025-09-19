import { z } from "zod";

export const signupSchema = {
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name must not exceed 50 characters"),

      email: z.string().trim().email("Please enter a valid email address"),

      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must not exceed 64 characters")
        .regex(
          /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/,
          "Password must contain at least one uppercase letter, one number, and one special character"
        ),

      confirmPassword: z.string().trim(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};
