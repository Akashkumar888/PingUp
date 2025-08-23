import imagekit from "../configs/imageKit.js";
import postModel from "../models/Post.js";
import  fs  from "fs";
import userModel from "../models/User.js";


// Add post
export const AddPost=async(req,res)=>{
  try {
    const {userId}=req.auth();
    const {content,post_type}=req.body;
    const images=req.files;
    let image_urls=[];
    if(images.length>0){
      // Promise.all([...]) runs them concurrently (in parallel), and waits until all uploads are finished.
      // Promise.all = "wait until all async tasks finish, then give me their results in an array".
      image_urls=await Promise.all(
        images.map(async(image)=>{
        let fileBuffer=fs.readFileSync(image.path);
        // Upload to ImageKit
              const response = await imagekit.upload({
                file: fileBuffer,                // file buffer
                fileName: image.originalname, // keep original name
                folder:'posts'
              });
        
              // Generate optimized image URL with transformation
              const url = imagekit.url({
                path: response.filePath,
                transformation: [
                  { quality: 'auto' },  // optimize quality automatically
                  { format: 'webp' },   // convert to webp
                  { width: '512' }      // resize width to 512px
                ]
              });
              return url;
        })
      )
    }
    await postModel.create({
      user:userId,
      content,
      image_urls,
      post_type,
    });
    res.json({success:true,message:"Post created Successfully."});
  } catch (error) {
   console.log(error);
   res.json({success:false,message:error.message}); 
  }
}

// get posts
export const getFeedPosts=async(req,res)=>{
  try {
    const {userId}=req.auth();
    const user=await userModel.findById(userId);
    // user connection and following
    const userIds=[userId,...user.connections,...user.following];
    const posts=await postModel.find({
      user:{
        $in: userIds,
      }
    }).populate("user").sort({createdAt:-1});
    // populate("user") → replaces user ObjectId in each post with the actual User document.
    res.json({success:true,posts});

  } catch (error) {
    console.log(error);
   res.json({success:false,message:error.message});
  } 
}

// like posts
export const likePost=async(req,res)=>{
  try {
    const {userId}=req.auth();
    const {postId}=req.body;
    const post=await postModel.findById(postId);
    if(post.likes_count.includes(userId)){
      post.likes_count=post.likes_count.filter(user=>user !== userId);
      await post.save();
      res.json({success:true,message:"Post unliked"});
    }
    else{
      post.likes_count.push(userId);
      await post.save();
      res.json({success:true,message:"Post liked"});
    }
  } catch (error) {
    console.log(error);
   res.json({success:false,message:error.message});
  }
}

