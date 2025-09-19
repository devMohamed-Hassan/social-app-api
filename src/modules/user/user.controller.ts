import { Router } from "express";
import { UserServices } from "./user.service";
import { validate } from "../../middlewares/validate.middleware";
import { signupSchema } from "./user.validation";

const userRouter = Router();
const userServices = new UserServices();

userRouter.get("/signup", validate(signupSchema), userServices.signup);

export default userRouter;
