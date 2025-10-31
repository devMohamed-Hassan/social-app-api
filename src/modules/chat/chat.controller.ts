import { Router } from "express";
import { ChatServices } from "./chat.service";

const chatRouter = Router({ mergeParams: true });
const chatServices = new ChatServices();

const routes = {
  getChat: "/",
};

chatRouter.get(routes.getChat, chatServices.getChat);

export default chatRouter;
