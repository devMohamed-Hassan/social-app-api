import { generateOtp } from "./generateOtp";

export interface OtpData {
  code: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  maxAttempts: number;
}

export function buildOtp(
  minutes: number = 10,
  maxAttempts: number = 5
): OtpData {
  return {
    code: generateOtp(),
    expiresAt: new Date(Date.now() + minutes * 60 * 1000),
    verified: false,
    attempts: 0,
    maxAttempts,
  };
}
