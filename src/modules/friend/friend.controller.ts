import { Router } from "express";
import { FriendService } from "./friend.service";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  acceptFriendRequestSchema,
  sendFriendRequestSchema,
  rejectFriendRequestSchema,
  cancelFriendRequestSchema,
  getFriendsSchema,
  getPendingRequestsSchema,
} from "./friend.validation";

const friendRouter = Router();
const friendService = new FriendService();

const routes = {
  getFriends: "/",
  sendRequest: "/request/:id",
  acceptRequest: "/accept/:id",
  rejectRequest: "/reject/:id",
  cancelRequest: "/cancel/:id",
  getPendingRequests: "/requests",
};

friendRouter.post(
  routes.sendRequest,
  authenticate,
  validate(sendFriendRequestSchema),
  friendService.sendRequest
);

friendRouter.patch(
  routes.acceptRequest,
  authenticate,
  validate(acceptFriendRequestSchema),
  friendService.acceptRequest
);

friendRouter.patch(
  routes.rejectRequest,
  authenticate,
  validate(rejectFriendRequestSchema),
  friendService.rejectRequest
);

friendRouter.delete(
  routes.cancelRequest,
  authenticate,
  validate(cancelFriendRequestSchema),
  friendService.cancelRequest
);

friendRouter.get(
  routes.getFriends,
  authenticate,
  validate(getFriendsSchema),
  friendService.getFriends
);

friendRouter.get(
  routes.getPendingRequests,
  authenticate,
  validate(getPendingRequestsSchema),
  friendService.getPendingRequests
);

export default friendRouter;
