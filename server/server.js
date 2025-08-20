// server.js
import "dotenv/config";

// import dotenv from "dotenv";
// dotenv.config();   // must be first! // ⬅ Load environment variables // no path needed


// older ways const require
// modern ways import export 
import express from 'express'
import cors from 'cors' 
import path from 'path'
import connectDB from './configs/db.js'; // ⬅ Must include .js extension in ESM

import { inngest, functions } from "./inngest/index.js"
import {serve} from 'inngest/express'
import { clerkMiddleware } from '@clerk/express'
import userRouter from './routes/userRoute.js';



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
  res.send("Working");
})
// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use('/api/user',userRouter);

app.listen(PORT,()=>{
  console.log(`Server is running on port :http://localhost:${PORT}`)
})

