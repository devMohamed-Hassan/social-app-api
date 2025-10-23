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

export const rejectFriendRequestSchema = {
  params: z.object({
    id: objectIdValidator,
  }),
};

export const cancelFriendRequestSchema = {
  params: z.object({
    id: objectIdValidator,
  }),
};

export const getFriendsSchema = {
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
};

export const getPendingRequestsSchema = {
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
};