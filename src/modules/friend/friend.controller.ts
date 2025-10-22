import { Router } from "express";
import { FriendService } from "./friend.service";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  acceptFriendRequestSchema,
  sendFriendRequestSchema,
} from "./friend.validation";

const friendRouter = Router();
const friendService = new FriendService();

const routes = {
  sendRequest: "/request/:id",
  acceptRequest: "/accept/:id",
  rejectRequest: "/reject/:id",
  cancelRequest: "/cancel/:id",
  getFriends: "/",
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

// friendRouter.patch(routes.rejectRequest, authenticate, friendService.rejectRequest);
// friendRouter.delete(routes.cancelRequest, authenticate, friendService.cancelRequest);
// friendRouter.get(routes.getFriends, authenticate, friendService.getFriends);
// friendRouter.get(routes.getPendingRequests, authenticate, friendService.getPendingRequests);

export default friendRouter;
