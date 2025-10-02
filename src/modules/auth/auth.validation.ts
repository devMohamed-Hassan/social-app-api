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

export const signupSchema = {
  body: z
    .object({
      firstName: firstNameValidator,
      lastName: lastNameValidator,
      email: emailValidator,
      age: ageValidator,
      phone: phoneValidator,
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
