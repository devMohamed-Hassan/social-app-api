import { z } from "zod";
import { objectIdValidator } from "../../common/validators";

export const createPostSchema = {
  body: z
    .object({
      content: z
        .string()
        .trim()
        .max(5000, "Content max length is 5000")
        .optional(),

      privacy: z
        .enum(["public", "friends", "only_me"])
        .default("public")
        .optional(),

      tags: z.array(objectIdValidator).optional(),

      files: z
        .array(
          z.object({
            originalname: z.string(),
            mimetype: z.string().regex(/^image\/(jpeg|png|jpg|webp)$/i, {
              message: "Only image files are allowed",
            }),
            size: z.number().max(5 * 1024 * 1024, "Image size must be <= 5MB"),
          })
        )
        .max(5, "You can upload up to 5 images")
        .optional()
        .default([]),
    })
    .superRefine((data, ctx) => {
      const hasContent =
        typeof data.content === "string" && data.content.trim().length > 0;

      const hasImages = Array.isArray(data.files) && data.files.length > 0;

      if (!hasContent && !hasImages) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Post must include at least content or one image",
          path: ["content"],
        });
      }
    }),
};

export const reactToPostSchema = {
  body: z.object({
    type: z.enum(
      ["like", "love", "haha", "sad", "angry"],
      "Reaction type must be one of: like, love, haha, sad, angry"
    ),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
  }),
};

export const postIdSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
  }),
};
