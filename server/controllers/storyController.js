import imagekit from "../configs/imageKit.js";
import storyModel from "../models/Story.js";
import { promises as fs } from "fs";
import userModel from "../models/User.js";
import { inngest } from "../inngest/index.js";

// add user story
export const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;
    const media = req.file;
    let media_url = null;

    if ((media_type === "image" || media_type === "video") && media) {
      const fileBuffer = await fs.readFile(media.path);

      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: media.originalname,
      });

      const transformations =
        media_type === "image"
          ? [{ quality: "auto" }, { format: "webp" }, { width: "512" }]
          : [{ quality: "auto" }];

      media_url = imagekit.url({
        path: response.filePath,
        transformation: transformations,
      });
    }

    const story=await storyModel.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });

    // shedule story deletion after 24 hours
    await inngest.send({
      name:"app/story.delete",
      data:{storyId:story._id},
    })

    res.json({ success: true, message: "Story created successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};



// get user story
export const getStories=async(req,res)=>{
  try {
    const {userId}=req.auth();
    const user=await userModel.findById(userId);
    //user connections and following
    const userIds=[userId,...user.connections,...user.following];

    const stories=await storyModel.find({
      user:{$in:userIds}
    }).populate('user');

    res.json({success:true,stories});
  } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
  }
}
