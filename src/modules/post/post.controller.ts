import { authenticate } from "../../middlewares/authenticate.middleware";
import { upload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { PostServices } from "./post.service";
import { Router } from "express";
import {
  createPostSchema,
  postIdSchema,
  reactToPostSchema,
} from "./post.validation";

const postRouter = Router();
const postServices = new PostServices();

const routes = {
  createPost: "/",
  getAllPosts: "/",
  getPostById: "/:id",
  updatePost: "/:id",
  deletePost: "/:id",
  reactToPost: "/:id/react",
  addComment: "/:id/comment",
};

postRouter.post(
  routes.createPost,
  authenticate,
  upload.array("images", 5),
  validate(createPostSchema),
  postServices.createPost
);

postRouter.get(routes.getAllPosts, authenticate, postServices.getAllPosts);

postRouter.get(
  routes.getPostById,
  authenticate,
  validate(postIdSchema),
  postServices.getPostById
);

postRouter.put(
  routes.updatePost,
  authenticate,
  upload.array("images", 5),
  validate(postIdSchema),
  postServices.updatePost
);

postRouter.delete(
  routes.deletePost,
  authenticate,
  validate(postIdSchema),
  postServices.deletePost
);

postRouter.post(
  routes.reactToPost,
  authenticate,
  validate(reactToPostSchema),
  postServices.reactToPost
);

export default postRouter;
