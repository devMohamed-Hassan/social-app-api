import z from "zod";
import { createPostSchema } from "./post.validation";

export type creatPostDto = z.infer<typeof createPostSchema.body>;
