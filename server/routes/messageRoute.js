
import express from 'express'
import { getChatMessages, sendMessage, sseController } from '../controllers/messageController.js';
const messageRouter=express.Router();
import {protect} from '../middlewares/auth.js'
import upload from "../configs/multer.js"
messageRouter.get("/:userId",sseController);
messageRouter.post("/send",upload.single("image"),protect,sendMessage);
messageRouter.post("/get",protect,getChatMessages);

export default messageRouter;

