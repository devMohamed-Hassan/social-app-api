import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { ValidationError } from "../utils/AppError";

type SchemaShape = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export const validate = (schema: SchemaShape) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        const result = schema.body.safeParse(req.body);
        if (!result.success) throw formatError(result.error, "body");
        req.body = result.data;
      }

      if (schema.query) {
        const result = schema.query.safeParse(req.query);
        if (!result.success) throw formatError(result.error, "query");
        req.query = result.data as any;
      }

      if (schema.params) {
        const result = schema.params.safeParse(req.params);
        if (!result.success) throw formatError(result.error, "params");
        req.params = result.data as any;
      }

      return next();
    } catch (err) {
      next(err);
    }
  };
};

function formatError(error: ZodError, source: "body" | "query" | "params") {
  const issues = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  return new ValidationError("Validation failed", {
    source,
    issues,
  });
}
