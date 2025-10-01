export type EmailEventType = "confirmEmail" | "forgotPassword" | "changeEmail";

export interface EmailConfig {
  subject: string;
  message: string;
  expiryMinutes: number;
}

export const emailEvents: Record<EmailEventType, EmailConfig> = {
  confirmEmail: {
    subject: "Please confirm your email",
    message:
      "Welcome to Social App! To complete your registration, use the secure verification code below:",
    expiryMinutes: 10,
  },
  forgotPassword: {
    subject: "Password Reset Request",
    message:
      "We received a request to reset your password. Use the OTP below to proceed:",
    expiryMinutes: 5,
  },
  changeEmail: {
    subject: "Confirm your new email address",
    message:
      "We received a request to change your email address on Social App. To confirm this change, please use the verification code below:",
    expiryMinutes: 10,
  },
};
