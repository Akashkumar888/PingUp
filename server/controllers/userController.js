import imagekit from "../configs/imageKit.js";
import userModel from "../models/User.js";
import fs from 'fs'

// ----------------------
// Get logged-in user data
// ----------------------
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth(); //✅Extract userId from Clerk decodes JWT/session here
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
    const { userId } = req.auth(); // ✅ Extract logged-in userId
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
    const { userId } = req.auth();  // ✅ extracting logged-in user's ID
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
    const { userId } = req.auth();
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

