import { Router } from "express";
import { UserServices } from "./user.service";

const userRouter = Router();
const userServices = new UserServices();

userRouter.get("/say-hello", userServices.sayHello);
userRouter.get("/get-user", userServices.getUser);

export default userRouter;
