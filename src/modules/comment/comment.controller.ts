import { Router } from "express";
import { CommentServices } from "./comment.service";
import { validate } from "../../middlewares/validate.middleware";
import { addCommentSchema, addReplySchema } from "./comment.validation";

const commentRouter = Router({ mergeParams: true });
const commentServices = new CommentServices();

const routes = {
  getComments: "/",
  addComments: "/",
  addReply: "/:commentIndex/reply",
};

commentRouter.get(routes.getComments, commentServices.getCommentsByPost);
commentRouter.post(
  routes.addComments,
  validate(addCommentSchema),
  commentServices.addComment
);
commentRouter.post(
  routes.addReply,
  validate(addReplySchema),
  commentServices.addReply
);

export default commentRouter;
