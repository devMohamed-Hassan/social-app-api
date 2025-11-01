import { Router } from "express";
import userRouter from "./modules/user/user.controller";
import authRouter from "./modules/auth/auth.controller";
import postRouter from "./modules/post/post.controller";
import friendRouter from "./modules/friend/friend.controller";
import chatRouter from "./modules/chat/chat.controller";
import groupChatRouter from "./modules/group/group.controller";

const routers = Router();

routers.use("/auth", authRouter);
routers.use("/users", userRouter);
routers.use("/posts", postRouter);
routers.use("/friends", friendRouter);
routers.use("/chat", chatRouter);
routers.use("/groups", groupChatRouter);

export default routers;
