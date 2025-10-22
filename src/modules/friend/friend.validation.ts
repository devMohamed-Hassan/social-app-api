import z from "zod";
import { objectIdValidator } from "../../common/validators";

export const sendFriendRequestSchema = {
  params: z.object({
    id: objectIdValidator,
  }),
};

export const acceptFriendRequestSchema = {
  params: z.object({
    id: objectIdValidator,
  }),
};
