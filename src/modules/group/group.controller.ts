import { authenticate } from "../../middlewares/authenticate.middleware";
import { Router } from "express";
import { GroupChatServices } from "./group.service";

const groupChatRouter = Router();
const groupChatServices = new GroupChatServices();

const routes = {
  createGroupChat: "/",
  getAllGroupChats: "/",
  getGroupChatById: "/:groupId",
  renameGroupChat: "/:groupId/name",
  addMemberToGroup: "/:groupId/add",
  removeMemberFromGroup: "/:groupId/remove",
};

groupChatRouter.post(
  routes.createGroupChat,
  authenticate,
  groupChatServices.createGroupChat
);

groupChatRouter.get(
  routes.getAllGroupChats,
  authenticate,
  groupChatServices.getAllGroupChats
);

groupChatRouter.get(
  routes.getGroupChatById,
  authenticate,
  groupChatServices.getGroupChatById
);

groupChatRouter.patch(
  routes.renameGroupChat,
  authenticate,
  groupChatServices.renameGroupChat
);

groupChatRouter.post(
  routes.addMemberToGroup,
  authenticate,
  groupChatServices.addMemberToGroup
);

groupChatRouter.delete(
  routes.removeMemberFromGroup,
  authenticate,
  groupChatServices.removeMemberFromGroup
);

export default groupChatRouter;
