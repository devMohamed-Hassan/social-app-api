import { Router } from "express";
import { AuthServices } from "./auth.service";
import { validate } from "../../middlewares/validate.middleware";
import * as validation from "./auth.validation";
import { authenticate } from "../../middlewares/authenticate.middleware";

const authRouter = Router();
const authServices = new AuthServices();

const routes = {
  signup: "/signup",
  confirmEmail: "/confirm-email",
  resendEmailOtp: "/resend-email-otp",
  login: "/login",
  refreshToken: "/refresh-token",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  updatePassword: "/update-password",
  updateEmail: "/update-email",
  confirmEmailUpdate: "/confirm-email-update",
};

authRouter.post(
  routes.signup,
  validate(validation.signupSchema),
  authServices.signup
);

authRouter.post(
  routes.confirmEmail,
  validate(validation.confirmEmailSchema),
  authServices.confirmEmail
);

authRouter.post(
  routes.resendEmailOtp,
  validate(validation.resendEmailOTPSchema),
  authServices.resendEmailOtp
);

authRouter.post(
  routes.login,
  validate(validation.loginSchema),
  authServices.login
);

authRouter.post(routes.refreshToken, authServices.refreshToken);

authRouter.post(
  routes.forgotPassword,
  validate(validation.forgotPasswordSchema),
  authServices.forgotPassword
);

authRouter.patch(
  routes.resetPassword,
  validate(validation.resetPasswordSechma),
  authServices.resetPassword
);

authRouter.patch(
  routes.updatePassword,
  authenticate,
  validate(validation.updatePasswordSchema),
  authServices.updatePassword
);

authRouter.patch(
  routes.updateEmail,
  authenticate,
  validate(validation.updateEmailSchema),
  authServices.updateEmail
);

authRouter.post(
  routes.confirmEmailUpdate,
  authenticate,
  validate(validation.confirmEmailUpdateSchema),
  authServices.confirmEmailUpdate
);

export default authRouter;
