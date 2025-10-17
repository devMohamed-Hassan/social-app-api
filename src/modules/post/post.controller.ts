import { authenticate } from "../../middlewares/authenticate.middleware";
import { upload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { PostServices } from "./post.service";
import { Router } from "express";
import { createPostSchema, reactToPostSchema } from "./post.validation";

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

// CRUD
postRouter.post(
  routes.createPost,
  authenticate,
  upload.array("images", 5),
  validate(createPostSchema),
  postServices.createPost
);

postRouter.get(routes.getAllPosts, authenticate, postServices.getAllPosts);

postRouter.get(routes.getPostById, authenticate, postServices.getPostById);
// postRouter.put("/:id", authMiddleware, updatePost);
// postRouter.delete("/:id", authMiddleware, deletePost);

postRouter.post(
  routes.reactToPost,
  authenticate,
  validate(reactToPostSchema),
  postServices.reactToPost
);

export default postRouter;
