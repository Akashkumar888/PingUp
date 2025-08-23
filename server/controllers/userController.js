import imagekit from "../configs/imageKit.js";
import { inngest } from "../inngest/index.js";
import connectionModel from "../models/Connection.js";
import postModel from "../models/Post.js";
import userModel from "../models/User.js";
import fs from 'fs'

// ----------------------
// Get logged-in user data
// ----------------------
export const getUserData = async (req, res) => {
  try {
    const { userId } =  req.auth(); //✅Extract userId from Clerk decodes JWT/session here
    const user = await userModel.findById(userId); // ✅ Find user in DB

    if (!user) return res.json({ success: false, message: 'No user found' });

    res.json({ success: true, user }); // ✅ Send user data back
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


// ----------------------
// Update user profile data
// ----------------------
export const updateUserData = async (req, res) => {
  try {
    const { userId } =  req.auth(); // ✅ Extract logged-in userId
    let { username, bio, full_name, location } = req.body;

    // ✅ Fetch current user details
    const tempUser = await userModel.findById(userId);

    // ✅ If username is not provided, keep old one
    !username && (username = tempUser.username);

    // ✅ If user wants to change username, check uniqueness
    if (tempUser.username !== username) {
      const user = await userModel.findOne({ username }); // <-- must query with object
      if (user) {
        // ❌ Username already exists → revert back
        username = tempUser.username;
      }
    }

    // ✅ Prepare update object
    const updatedUser = {
      username,
      bio,
      full_name,
      location,
    };

    // ✅ Check if profile image was uploaded
    const profile = req.files.profile && req.files.profile[0];
    const cover = req.files.cover && req.files.cover[0];

    // ----------------------------
    // Profile Picture Upload Logic
    // ----------------------------
    if (profile) {
      const buffer = fs.readFileSync(profile.path); // Read file into buffer

      // Upload to ImageKit
      const response = await imagekit.upload({
        file: buffer,                // file buffer
        fileName: profile.originalname, // keep original name
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

      // Save in updatedUser object
      updatedUser.profile_picture = url;
    }

    // ----------------------------
    // Cover Photo Upload Logic
    // ----------------------------
    if (cover) {
      const buffer = fs.readFileSync(cover.path);

      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });

      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: 'auto' },
          { format: 'webp' },
          { width: '1280' } // bigger width for cover
        ]
      });

      updatedUser.cover_photo = url;
    }

    // ✅ Finally, update user in database
    const user = await userModel.findByIdAndUpdate(userId, updatedUser, { new: true });

    res.json({ success: true, user, message: 'Profile updated successfully' });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}



// find user using username, email, location, fileName
export const discoverUsers = async (req, res) => {
  try {
    const { userId } =  req.auth();  // ✅ extracting logged-in user's ID
    const { input } = req.body;     // ✅ input string from frontend (search query)

    // 🔍 Query the database for users matching input in username/email/full_name/location
    const allUser = await userModel.find({
      $or: [
        { username: new RegExp(input, 'i') },  // case-insensitive match
        { email: new RegExp(input, 'i') },
        { full_name: new RegExp(input, 'i') },
        { location: new RegExp(input, 'i') },
      ]
    });

    // ❌ Remove the logged-in user from results
    const filteredUser = allUser.filter((user) => userId !== user._id);

    // ✅ Send response back
    res.json({ success: true, users: filteredUser });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------
// Follow another user
// ----------------------
export const followUser = async (req, res) => {
  try {
    const { userId } =  req.auth();
    const { id } = req.body; // the target user to follow

    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const user = await userModel.findById(userId);
    const toUser = await userModel.findById(id);

    if (!user || !toUser) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "You are already following this user",
      });
    }

    // Add to following/followers
    user.following.push(id);
    toUser.followers.push(userId);

    await user.save();
    await toUser.save();

    res.json({ success: true, message: "Now you are following this user" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------
// Unfollow another user
// ----------------------
export const unfollowUser = async (req, res) => {
  try {
    const { userId } =  req.auth();
    const { id } = req.body; // the target user to follow
    
    const user=await userModel.findById(userId);
    user.following=user.following.filter(user => user !== id);
    await user.save();
    
    const toUser=await userModel.findById(id);
    toUser.followers=toUser.followers.filter(user => user !== userId);
    await toUser.save();

    res.json({ success: true, message: "You are no longer following this user." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};



// send connection request
export const sendConnectionRequest=async(req,res)=>{
  try {
    const { userId } =  req.auth();
    const {id}=req.body;

    //check if user has sent more than 20 connections request in the last 24 hours 

    const last24Hours=new Date(Date.now()- 24*60*60*1000);
    const connectionRequest=await connectionModel.find({
      from_user_id:userId,
      created_at: { $gt: last24Hours }
    });
    if(connectionRequest.length>=20){
      return res.json({success:false, message:"You have sent more than 20 connection in the last 24 hours"});
    }
    // check if user are already connected

    // findOne()
    // Returns a single document (the first match it finds).
    // If no match is found → returns null.
    // You can pass an _id or any other condition.
    // const connection = await connectionModel.findOne({ from_user_id: someId });
    // const connection = await connectionModel.findOne({ _id: "66b5f9..." });
    // connection will be a single object or null

    // find()
    // Returns an array of documents (even if only one matches).
    // If no match is found → returns an empty array [].
    // You can pass an _id or any other condition.
    // const connections = await connectionModel.find({ from_user_id: someId });
    // connections will be an array of objects or []
    // const connections = await connectionModel.find({ _id: "66b5f9..." });


    const connection=await connectionModel.findOne({
      $or:[
        {from_user_id:userId,to_user_id:id},
        {from_user_id:id,to_user_id:userId},
      ]
    });
    if(!connection){
      const newConnection=await connectionModel.create({
        from_user_id:userId,
        to_user_id:id,
      })
      await inngest.send({
        name:"app/connection-request",
        data:{connectionId:newConnection._id},
      })
      return res.json({success:true,message:"Connection request sent successfully"});
    }
    else if(connection && connection.status==='accepted'){
      return res.json({success:false,message:"You are already connected with this user"});
    }
    return res.json({success:false,message:"Connection request pending."});

  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
  }
}

// get user connection 
export const getUserConnections=async(req,res)=>{
  try {
    const { userId } =  req.auth();
    const user=await userModel.findById(userId).populate("connections following followers");

    // Uses .populate("connections following followers") → replaces the ObjectId references with the actual user documents from those collections.
    // So now user.connections, user.following, and user.followers will be arrays of full user documents, not just IDs.
    // Stores the arrays of connected users (connections), users they follow (following), and users who follow them (followers).

    const connections=user.connections;
    const following=user.following;
    const followers=user.followers;

    const pendingConnections=(await connectionModel.find({
      to_user_id:userId,
      status:"pending"
    }).populate('from_user_id')).map(connection=>connection.from_user_id);
   
    res.json({success:true,connections, following, followers, pendingConnections});
  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
  }
}


// Accept connection request
export const acceptConnectionRequest=async(req,res)=>{
  try {
    const { userId } =  req.auth();
    const {id}=req.body;

    const connection =await connectionModel.findOne({
      from_user_id:id,
      to_user_id:userId,
    });
    
    if(!connection){
      return res.json({success:false,message:"Connection not found"});
    }
    const user=await userModel.findById(userId);
    user.connections.push(id);
    await user.save();

    const toUser=await userModel.findById(id);
    toUser.connections.push(userId);
    await toUser.save();

    connection.status='accepted';
    await connection.save();

    return res.json({success:true,message:"Connection accepted Successfully"});

  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
  }
}



// get user profile

export const getUserProfiles=async(req,res)=>{
  try {
    const {profileId}=req.body;
    const profile=await userModel.findById(profileId);
    if(!profile)return res.json({success:false,message:"Profile not found"});
    const posts=await postModel.find({user:profileId}).populate('user');
    res.json({success:true,profile, posts});

  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
  }
}