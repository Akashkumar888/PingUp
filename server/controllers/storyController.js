// controllers/storyController.js
import imagekit from "../configs/imageKit.js";
import storyModel from "../models/Story.js";
import userModel from "../models/User.js";
import { inngest } from "../inngest/index.js";

// Add story
export const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;
    const media = req.file;
    let media_url = null;

    if (media && (media_type === "image" || media_type === "video")) {
      const base64File = media.buffer.toString("base64");

      const response = await imagekit.upload({
        file: base64File,
        fileName: media.originalname,
        useUniqueFileName: true,
        folder: "/stories",
      });

      media_url =
        media_type === "image"
          ? imagekit.url({
              path: response.filePath,
              transformation: [
                { quality: "auto" },
                { format: "webp" },
                { width: "512" },
              ],
            })
          : response.url; // videos keep original URL
    }

    const story = await storyModel.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });

    // Schedule deletion after 24h
    await inngest.send({ name: "app/story.delete", data: { storyId: story._id } });

    res.json({ success: true, message: "Story created successfully", story });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stories
export const getStories = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await userModel.findById(userId);
    const userIds = [userId, ...user.connections, ...user.following];

    const stories = await storyModel.find({ user: { $in: userIds } }).populate("user");

    res.json({ success: true, stories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete story
export const deleteStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { storyId } = req.params;

    const story = await storyModel.findById(storyId);

    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

    if (story.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await storyModel.findByIdAndDelete(storyId);

    res.json({ success: true, message: "Story deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
