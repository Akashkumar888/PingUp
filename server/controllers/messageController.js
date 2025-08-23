import messageModel from "../models/Message.js";


// create an empty object to store server side event contributions 
let connections={};

export const sendMessage=async(req,res)=>{
  try {
    
  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
  }
}
