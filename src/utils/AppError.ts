export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  details: {
    source: "body" | "query" | "params";
    issues: { path: string; message: string }[];
  };

  constructor(
    message: string,
    details: {
      source: "body" | "query" | "params";
      issues: { path: string; message: string }[];
    }
  ) {
    super(message, 400);
    this.details = details;
  }
}
