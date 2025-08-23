// server.js
import express from 'express'
import cors from 'cors' 
import 'dotenv/config';

// import dotenv from "dotenv";
// dotenv.config();   // must be first! // ⬅ Load environment variables // no path needed


// older ways const require
// modern ways import export 

import connectDB from './configs/db.js'; // ⬅ Must include .js extension in ESM

import { inngest, functions } from "./inngest/index.js"
import {serve} from 'inngest/express'
import { clerkMiddleware } from '@clerk/express'
import userRouter from './routes/userRoute.js';
import postRouter from './routes/postRoute.js';
import storyRouter from './routes/storyRoute.js';
import messageRouter from './routes/messageRoute.js';



const app=express();
const PORT=process.env.PORT || 4000;


// middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(clerkMiddleware())



// Connect DB
await connectDB();


app.get('/',(req,res)=>{
  res.send("Server is Working");
})
// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use('/api/user',userRouter);
app.use('/api/post',postRouter);
app.use('/api/story',storyRouter);
app.use('/api/message',messageRouter);

app.listen(PORT,()=>{
  console.log(`Server is running on port :http://localhost:${PORT}`)
})

