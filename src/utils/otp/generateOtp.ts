import otpGenerator from "otp-generator";

export interface OtpOptions {
  upperCaseAlphabets?: boolean;
  lowerCaseAlphabets?: boolean;
  specialChars?: boolean;
  digits?: boolean;
}

export function generateOtp(
  length: number = 6,
  options: OtpOptions = {}
): string {
  return otpGenerator.generate(length, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    digits: true,
    ...options,
  });
}
