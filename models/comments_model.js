const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  content: String,
  date: { type: Date, default: Date.now },
});

const commentModel = mongoose.model("Comment", commentSchema);

module.exports = commentModel;
