import { authenticate } from "../../middlewares/authenticate.middleware";
import { upload } from "../../middlewares/multer.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { PostServices } from "./post.service";
import { Router } from "express";
import { createPostSchema } from "./post.validation";

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

// postRouter.get("/:id", authMiddleware, getPostById);
// postRouter.put("/:id", authMiddleware, updatePost);
// postRouter.delete("/:id", authMiddleware, deletePost);

// // Reactions & Comments
// postRouter.post("/:id/react", authMiddleware, reactToPost);
// postRouter.post("/:id/comment", authMiddleware, addComment);

export default postRouter;
