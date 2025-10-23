import { NextFunction, Request, Response, Router } from "express";
import { UserServices } from "./user.service";
import { sendSuccess } from "../../utils/sendSuccess";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { upload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  updateUserInfoSchema,
  blockUserSchema,
  unblockUserSchema,
  getBlockedUsersSchema,
  getUserByIdSchema,
} from "./user.validation";

const userRouter = Router();
const userServices = new UserServices();

const routes = {
  me: "/me",
  getUserById: "/:id",
  updateMe: "/me",
  profileImage: "/profile-image",
  coverImage: "/cover-image",
  presignedProfileImage: "/profile-image/presigned",
  deleteProfileImage: "/profile-image",
  deleteCoverImage: "/cover-image",
  blockUser: "/block/:id",
  unblockUser: "/block/:id",
  getBlockedUsers: "/blocked",
};

userRouter.get(routes.me, authenticate, userServices.me);

userRouter.get(
  routes.getUserById,
  authenticate,
  validate(getUserByIdSchema),
  userServices.getUserById
);

userRouter.patch(
  routes.updateMe,
  authenticate,
  validate(updateUserInfoSchema),
  userServices.updateUserInfo
);

userRouter.patch(
  routes.profileImage,
  authenticate,
  upload.single("profileImage"),
  userServices.profileImage
);

userRouter.patch(
  routes.coverImage,
  authenticate,
  upload.single("coverImage"),
  userServices.coverImage
);

userRouter.post(
  routes.presignedProfileImage,
  authenticate,
  userServices.generatePresignedProfileUrl
);

userRouter.delete(
  routes.deleteProfileImage,
  authenticate,
  userServices.deleteProfileImage
);

userRouter.delete(
  routes.deleteCoverImage,
  authenticate,
  userServices.deleteCoverImage
);

userRouter.post(
  routes.blockUser,
  authenticate,
  validate(blockUserSchema),
  userServices.blockUser
);

userRouter.delete(
  routes.unblockUser,
  authenticate,
  validate(unblockUserSchema),
  userServices.unblockUser
);

userRouter.get(
  routes.getBlockedUsers,
  authenticate,
  validate(getBlockedUsersSchema),
  userServices.getBlockedUsers
);

export default userRouter;
