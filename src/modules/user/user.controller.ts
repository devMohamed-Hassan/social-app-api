import { NextFunction, Request, Response, Router } from "express";
import { UserServices } from "./user.service";
import { sendSuccess } from "../../utils/sendSuccess";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { upload } from "../../middlewares/multer.middleware";

const userRouter = Router();
const userServices = new UserServices();

userRouter.get(
  "/me",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    return sendSuccess({
      res,
      statusCode: 200,
      data: { user: req.user },
    });
  }
);

userRouter.patch(
  "/profile-image",
  authenticate,
  upload.single("profileImage"),
  userServices.profileImage
);

userRouter.patch(
  "/cover-image",
  authenticate,
  upload.single("coverImage"),
  userServices.coverImage
);

userRouter.post(
  "/profile-image/presigned",
  authenticate,
  userServices.generatePresignedProfileUrl
);

userRouter.delete(
  "/profile-image",
  authenticate,
  userServices.deleteProfileImage
);

userRouter.delete("/cover-image", authenticate, userServices.deleteCoverImage);

export default userRouter;
