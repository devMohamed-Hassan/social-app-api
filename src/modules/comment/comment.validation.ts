import { z } from "zod";

export const postIdParamSchema = z.object({
  postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
});

export const addCommentSchema = {
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Comment text is required")
      .max(500, "Comment text must not exceed 500 characters"),
  }),
};

export const addReplySchema = {
  params: z.object({
    commentIndex: z
      .string()
      .regex(/^\d+$/, "Comment index must be a valid number"),
  }),
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Reply text is required")
      .max(300, "Reply text must not exceed 300 characters"),
  }),
};

export const deleteCommentSchema = {
  params: z.object({
    commentIndex: z
      .string()
      .regex(/^\d+$/, "Comment index must be a valid number"),
  }),
};

export const updateCommentSchema = {
  params: z.object({
    commentIndex: z
      .string()
      .regex(/^\d+$/, "Comment index must be a valid number"),
  }),
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Comment text is required")
      .max(500, "Comment text must not exceed 500 characters"),
  }),
};

export const updateReplySchema = {
  params: z.object({
    commentIndex: z.string().regex(/^\d+$/, "commentIndex must be a number"),
    replyIndex: z.string().regex(/^\d+$/, "replyIndex must be a number"),
  }),
  body: z.object({
    text: z
      .string()
      .trim()
      .min(1, "Reply text is required")
      .max(300, "Reply text must not exceed 300 characters"),
  }),
};

export const deleteReplySchema = {
  params: z.object({
    commentIndex: z.string().regex(/^\d+$/, "commentIndex must be a number"),
    replyIndex: z.string().regex(/^\d+$/, "replyIndex must be a number"),
  }),
};
