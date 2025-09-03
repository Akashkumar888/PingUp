// controllers/messageController.js
import imagekit from "../configs/imageKit.js";
import messageModel from "../models/Message.js";

let connections = {}; // SSE clients

// SSE connection
export const sseController = (req, res) => {
  const { userId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  connections[userId] = res;
  res.write("log: Connected\n\n");

  req.on("close", () => delete connections[userId]);
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const file = req.file;

    let media_url = null;
    let message_type = "text";

    if (file) {
      const base64File = file.buffer.toString("base64");
      const response = await imagekit.upload({
        file: base64File,
        fileName: file.originalname,
        useUniqueFileName: true,
        folder: "/messages",
      });

      if (file.mimetype.startsWith("image")) {
        message_type = "image";
        media_url = imagekit.url({
          path: response.filePath,
          transformation: [{ quality: "auto" }, { format: "webp" }, { width: "1280" }],
        });
      } else if (file.mimetype.startsWith("video")) {
        message_type = "video";
        media_url = response.url;
      }
    }

    const message = await messageModel.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    if (connections[to_user_id]) {
      connections[to_user_id].write(`data: ${JSON.stringify(message)}\n\n`);
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chat messages
export const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id } = req.body;

    const messages = await messageModel
      .find({ $or: [{ from_user_id: userId, to_user_id }, { from_user_id: to_user_id, to_user_id: userId }] })
      .sort({ createdAt: -1 });

    await messageModel.updateMany({ from_user_id: to_user_id, to_user_id: userId }, { seen: true });

    res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's recent messages
export const getUserRecentMessages = async (req, res) => {
  try {
    const { userId } = req.auth();
    const messages = await messageModel
      .find({ to_user_id: userId })
      .populate("from_user_id to_user_id")
      .sort({ createdAt: -1 });

    res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// Edit message
export const editMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;
    const { text } = req.body;

    const message = await messageModel.findById(id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    if (String(message.from_user_id) !== String(userId)) return res.status(403).json({ success: false, message: "Not allowed" });

    message.text = text;
    message.isEdited = true;
    await message.save();

    if (connections[message.to_user_id]) {
      connections[message.to_user_id].write(`data: ${JSON.stringify({ type: "EDIT", message })}\n\n`);
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete message for me
export const deleteForMe = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;

    const message = await messageModel.findById(id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    message.hiddenFor = message.hiddenFor || [];
    if (!message.hiddenFor.includes(userId)) message.hiddenFor.push(userId);
    await message.save();

    res.json({ success: true, id, scope: "me" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete message for everyone
export const deleteForEveryone = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;

    const message = await messageModel.findById(id);
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    if (String(message.from_user_id) !== String(userId)) return res.status(403).json({ success: false, message: "Not allowed" });

    await messageModel.findByIdAndDelete(id);

    if (connections[message.to_user_id]) {
      connections[message.to_user_id].write(`data: ${JSON.stringify({ type: "DELETE", id })}\n\n`);
    }

    res.json({ success: true, id, scope: "everyone" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
