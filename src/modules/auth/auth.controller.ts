import { Router } from "express";
import { AuthServices } from "./auth.service";
import { validate } from "../../middlewares/validate.middleware";
import * as validation from "./auth.validation";

const authRouter = Router();
const authServices = new AuthServices();

authRouter.post(
  "/signup",
  validate(validation.signupSchema),
  authServices.signup
);

authRouter.post(
  "/confirm-email",
  validate(validation.confirmEmailSchema),
  authServices.confirmEmail
);
authRouter.post(
  "/resend-email-otp",
  validate(validation.resendEmailOTPSchema),
  authServices.resendEmailOtp
);

authRouter.post("/login", validate(validation.loginSchema), authServices.login);
authRouter.post("/refresh-token", authServices.refreshToken);

export default authRouter;
