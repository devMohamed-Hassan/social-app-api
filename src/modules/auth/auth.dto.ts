export interface SignupDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
  phone: string;
}

export interface ConfirmEmailDTO {
  email: string;
  otp: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ResetPasswordDTO {
  email: string;
  otp: string;
  password: string;
}
