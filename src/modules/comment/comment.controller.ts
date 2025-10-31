import { Router } from "express";
import { CommentServices } from "./comment.service";
import { validate } from "../../middlewares/validate.middleware";
import {
  addCommentSchema,
  addReplySchema,
  deleteCommentSchema,
  deleteReplySchema,
  updateCommentSchema,
  updateReplySchema,
} from "./comment.validation";

const commentRouter = Router({ mergeParams: true });
const commentServices = new CommentServices();

const routes = {
  getComments: "/",
  addComments: "/",
  addReply: "/:commentIndex/reply",
  deleteComment: "/:commentIndex",
  updateComment: "/:commentIndex",
  updateRelpy: "/:commentIndex/reply/:replyIndex",
  deleteReply: "/:commentIndex/reply/:replyIndex",
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

commentRouter.delete(
  routes.deleteComment,
  validate(deleteCommentSchema),
  commentServices.deleteComment
);
commentRouter.patch(
  routes.updateComment,
  validate(updateCommentSchema),
  commentServices.updateComment
);

commentRouter.patch(
  routes.updateRelpy,
  validate(updateReplySchema),
  commentServices.updateReply
);
commentRouter.delete(
  routes.deleteReply,
  validate(deleteReplySchema),
  commentServices.deleteReply
);

export default commentRouter;
