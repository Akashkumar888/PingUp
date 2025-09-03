// controllers/PostController.js
import imagekit from "../configs/imageKit.js";
import postModel from "../models/Post.js";
import userModel from "../models/User.js";

// Add post with multiple images
export const AddPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files;
    let image_urls = [];

    if (images && images.length > 0) {
      image_urls = await Promise.all(
        images.map(async (img) => {
          const base64File = img.buffer.toString("base64");

          const response = await imagekit.upload({
            file: base64File,
            fileName: img.originalname,
            folder: "/posts",
            useUniqueFileName: true,
          });

          return imagekit.url({
            path: response.filePath,
            transformation: [{ quality: "auto" }, { format: "webp" }, { width: "512" }],
          });
        })
      );
    }

    await postModel.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });

    res.json({ success: true, message: "Post created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get feed posts
export const getFeedPosts = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await userModel.findById(userId);
    const userIds = [userId, ...user.connections, ...user.following];

    const posts = await postModel.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like/unlike post
export const likePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;

    const post = await postModel.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter((id) => id.toString() !== userId);
      await post.save();
      return res.json({ success: true, message: "Post unliked" });
    } else {
      post.likes_count.push(userId);
      await post.save();
      return res.json({ success: true, message: "Post liked" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.params;

    const post = await postModel.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (post.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this post" });
    }

    await postModel.findByIdAndDelete(postId);
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
