import { Router } from "express";
import { ChatServices } from "./chat.service";

const chatRouter = Router();

const routes = {};
const chatServices = new ChatServices();

export default chatRouter;
