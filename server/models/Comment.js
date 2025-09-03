import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId, // post is still ObjectId ref
      ref: "Post",
      required: true,
    },
    user: {
      type: String, // Clerk userId is string
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const commentModel =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default commentModel;
