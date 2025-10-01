import dotenv from "dotenv";

dotenv.config();

interface Env {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  MONGO_URI: string;
  CLIENT_URL: string;
  SALT_ROUNDS: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
}

const getEnv = (key: keyof Env, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value || defaultValue!;
};

export const ENV: Env = {
  NODE_ENV:
    (process.env.NODE_ENV as "development" | "production" | "test") ||
    "development",
  PORT: Number(getEnv("PORT", "5000")),
  MONGO_URI: getEnv("MONGO_URI"),
  CLIENT_URL: getEnv("CLIENT_URL", "http://localhost:3000"),
  SALT_ROUNDS: Number(getEnv("SALT_ROUNDS", "10")),
  EMAIL_USER: getEnv("EMAIL_USER"),
  EMAIL_PASS: getEnv("EMAIL_PASS"),
};
