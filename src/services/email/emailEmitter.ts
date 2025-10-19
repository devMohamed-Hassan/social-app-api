import { EventEmitter } from "events";
import { emailEvents, EmailEventType } from "./emailEvents.js";
import { emailTemplate } from "./emailTemplate.js";
import { sendEmail } from "./sendEmail.js";

interface LoginDetails {
  ip: string;
  userAgent: string;
  location?: string;
  time: string;
}

interface EmailPayload {
  type: EmailEventType;
  email: string;
  userName: string;
  otp?: string;
  loginDetails?: LoginDetails;
}

const emailEmitter = new EventEmitter();

emailEmitter.on(
  "sendEmail",
  async ({ type, email, userName, otp, loginDetails }: EmailPayload) => {
    try {
      const config = emailEvents[type];
      if (!config) throw new Error(`Unknown email type: ${type}`);

      const html = emailTemplate({
        code: otp,
        name: userName,
        subject: config.subject,
        message: config.message,
        expiryMinutes: config.expiryMinutes,
        loginDetails,
      });

      await sendEmail({ to: email, subject: config.subject, html });

      console.log(`Email: ${config.subject} sent to ${email}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unexpected error";
      console.error(`Failed to send email: ${type} -> ${errorMessage}`);
    }
  }
);

export default emailEmitter;
