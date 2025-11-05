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
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  BEARER_KEY: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_S3_BUCKET_NAME: string;
  CRYPTO_KEY: string;
  MONGO_ATLS_URI: string;
}

const getEnv = <K extends keyof Env>(key: K, defaultValue?: string): string => {
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
  ACCESS_TOKEN_SECRET: getEnv("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: getEnv("REFRESH_TOKEN_SECRET"),
  BEARER_KEY: getEnv("BEARER_KEY"),
  AWS_REGION: getEnv("AWS_REGION"),
  AWS_ACCESS_KEY_ID: getEnv("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: getEnv("AWS_SECRET_ACCESS_KEY"),
  AWS_S3_BUCKET_NAME: getEnv("AWS_S3_BUCKET_NAME"),
  CRYPTO_KEY: getEnv("CRYPTO_KEY", "default_32_character_crypto_key_1234"),
  MONGO_ATLS_URI: getEnv("MONGO_ATLS_URI"),
};
