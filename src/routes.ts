import { Router } from "express";
import userRouter from "./modules/user/user.controller";



const routers = Router();

routers.use("/users", userRouter);

export default routers;
