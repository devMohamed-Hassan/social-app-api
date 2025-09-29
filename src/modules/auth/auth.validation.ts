import { z } from "zod";

export const signupSchema = {
  body: z
    .object({
      firstName: z
        .string()
        .trim()
        .min(2, { message: "First name must be at least 2 characters long" })
        .max(30, { message: "First name must not exceed 30 characters" })
        .regex(/^[A-Za-z]+$/, {
          message: "First name must contain only letters",
        }),

      lastName: z
        .string()
        .trim()
        .min(2, { message: "Last name must be at least 2 characters long" })
        .max(30, { message: "Last name must not exceed 30 characters" })
        .regex(/^[A-Za-z]+$/, {
          message: "Last name must contain only letters",
        }),

      email: z
        .string()
        .trim()
        .email({ message: "Please enter a valid email address" })
        .max(100, { message: "Email must not exceed 100 characters" }),

      age: z
        .number()
        .int()
        .min(18, { message: "You must be at least 18 years old" })
        .max(100, { message: "Age must not exceed 100 years" }),

      phone: z
        .string()
        .trim()
        .regex(/^\+?[0-9]{10,15}$/, {
          message: "Phone number must be valid (10–15 digits, optional +)",
        }),

      password: z
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
        }),

      rePassword: z.string().trim(),
    })
    .refine((data) => data.password === data.rePassword, {
      message: "Passwords do not match",
      path: ["rePassword"],
    }),
};
