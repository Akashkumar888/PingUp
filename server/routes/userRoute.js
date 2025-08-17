import express from 'express'
import {getUserData,updateUserData} from '../controllers/userController.js'

const userRouter=express.Router();



// form-data key = "image"
userRouter.get("/",upload.single("image"),processImage, getUserData);
userRouter.post("/",updateUserData);


export default userRouter

