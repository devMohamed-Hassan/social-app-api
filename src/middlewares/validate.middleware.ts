import { NextFunction, Request, Response } from "express";
import { ZodError, ZodTypeAny } from "zod";
import { ValidationError } from "../utils/AppError";

type SchemaShape = Partial<{
  body: ZodTypeAny;
  query: ZodTypeAny;
  params: ZodTypeAny;
  file: ZodTypeAny;
  files: ZodTypeAny;
}>;

type ValidationSource = keyof SchemaShape;

export const validate = (schema: SchemaShape) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const sources: Record<ValidationSource, any> = {
        body: req.body,
        query: req.query,
        params: req.params,
        file: req.file,
        files: req.files,
      };

      for (const key of Object.keys(schema) as ValidationSource[]) {
        const validator = schema[key];
        if (!validator) continue;

        let data = sources[key];
        if (key === "body" && req.files) {
          data = { ...req.body, files: req.files };
        }

        const result = validator.safeParse(data);
        if (!result.success) throw formatError(result.error, key);

        (req as any)[key] = result.data;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

function formatError(error: ZodError, source: ValidationSource) {
  const issues = error.issues
    .map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }))
    .filter(
      (issue, index, self) =>
        index ===
        self.findIndex(
          (i) => i.path === issue.path && i.message === issue.message
        )
    );

  return new ValidationError("Validation failed", { source, issues });
}
