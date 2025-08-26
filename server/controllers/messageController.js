import imagekit from "../configs/imageKit.js";
import messageModel from "../models/Message.js";
import fs from 'fs'

// create an empty object to store server side event contributions 
let connections={};

// controller function for server side event endpoint

export const sseController=async(req,res)=>{
  try {
    const {userId}=req.params;
    console.log("New client connected: ",userId);
    // set sse headers
    res.setHeader("Content-Type","text/event-stream");
    res.setHeader("Cache-Control","no-cache");
    res.setHeader("Connection","keep-alive");
    res.setHeader("Access-Control-Allow-Origin","*");
    //add the client's response object to the connection objects
    connections[userId]=res;
    // send an initial event to the client 
    res.write("log: Connected to SSE stream\n\n");
    // handle client disconnections
    req.on("close",()=>{
      //remove the client's response object from connections array 
      delete connections[userId];
      console.log("Client Disconnected.");
    }) 
  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
  }
}

// send message 
export const sendMessage=async(req,res)=>{
  try {
    const {userId}=req.auth();
    const {to_user_id,text}=req.body;
    const image=req.file;
    let media_url="";
    let message_type=image?'image':'text';
    if(message_type==='image'){
      let fileBuffer=fs.readFileSync(image.path);
      const response=await imagekit.upload({
        file:fileBuffer,
        fileName:image.originalname,
      })
       media_url=imagekit.url({
        path:response.filePath,
        transformation:[
          {quality:'auto'},
          {format:'webp'},
          {width:'1280'},
        ]
      })
    }
    const message=await messageModel.create({
      from_user_id:userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });
    res.json({success:true,message});
    // send message to user_id using SSE
    const messageWithUserData=await messageModel.findById(message._id).populate("from_user_id");
    if(connections[to_user_id]){
      connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`);
    }

  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
  }
}

// get chat message
export const getChatMessages=async(req,res)=>{
  try {
    const {userId}=req.auth();
    const {to_user_id}=req.body;
    const messages=await messageModel.find({
      $or:[
        {from_user_id:userId,to_user_id},
        {from_user_id:to_user_id,to_user_id:userId},
      ]
    }).sort({created_at:-1});
    // mark messages as seen
    await messageModel.updateMany({from_user_id:to_user_id,to_user_id:userId},{seen:true});
    res.json({success:true,messages});
  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
  }
}

export const getUserRecentMessages=async(req,res)=>{
  try {
    const {userId}=req.auth();
    const messages=await messageModel.find({to_user_id:userId}).populate('from_user_id to_user_id').sort({createdAt:-1});
    res.json({success:true,messages});
  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
  }
}

