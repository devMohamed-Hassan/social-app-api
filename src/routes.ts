import { NextFunction, Request, Response, Router } from "express";
import userRouter from "./modules/user/user.controller";
import authRouter from "./modules/auth/auth.controller";
import postRouter from "./modules/post/post.controller";
import friendRouter from "./modules/friend/friend.controller";
import commentRouter from "./modules/comment/comment.controller";
import { sendSuccess } from "./utils/sendSuccess";

const routers = Router();

routers.use("/auth", authRouter);
routers.use("/users", userRouter);
routers.use("/posts", postRouter);
routers.use("/friends", friendRouter);

export default routers;
