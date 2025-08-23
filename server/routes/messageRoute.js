
import express from 'express'
import { protect } from '../middlewares/auth.js';
import { sendMessage } from '../controllers/messageController.js';
const messageRouter=express.Router();

messageRouter.post("/send",protect,sendMessage);

export default messageRouter;

