
import express from "express";
import { addComment, getComments, editComment, deleteComment } from "../controllers/CommentController.js";
import { protect } from "../middlewares/auth.js";

const commentRouter = express.Router();

commentRouter.post("/add", protect, addComment);
commentRouter.get("/:postId", protect, getComments);
commentRouter.put("/edit", protect, editComment);
commentRouter.delete("/delete", protect, deleteComment);

export default commentRouter;

