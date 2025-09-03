import express from "express";
import {
  deleteForEveryone,
  deleteForMe,
  editMessage,
  getChatMessages,
  sendMessage,
  sseController,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/auth.js";
import upload from "../configs/multer.js";

const messageRouter = express.Router();

messageRouter.get("/:userId", sseController);
messageRouter.post("/send", upload.single("media"), protect, sendMessage);
messageRouter.post("/get", protect, getChatMessages);
messageRouter.put("/:id/edit", protect, editMessage);      // fixed
// messageRouter.js
messageRouter.delete("/:id/me", protect, deleteForMe);
messageRouter.delete("/:id/everyone", protect, deleteForEveryone);


export default messageRouter;
