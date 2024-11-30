const Comment = require("../models/comments_model");

const createComment = async (req, res) => {
  try {
    const { postId, sender, content } = req.body;
    if (!(postId || sender || content)) {
      return res
        .status(400)
        .json({ error: "All fields are required: postId, sender, content" });
    }
    const comment = await Comment.create({ sender, postId, content });
    res
      .status(201)
      .json({ message: "Comment created successfully", comment: comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCommentsBySender = async (req, res) => {
  const filter = req.body.sender;
  let comments;
  try {
    comments = filter
      ? await Comment.find({ sender: filter })
      : await Comment.find();
    res.send(comments);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getCommentById = async (req, res) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (comment) {
      res.send(comment);
    } else {
      res.status(404).send("Comment was not found");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.post_id;
    if (!postId) {
      return res.status(400).json({ error: "Post ID is required." });
    }
    const comments = await Comment.find({ postId });
    if (!comments || comments.length === 0) {
      return res
        .status(404)
        .json({ message: "No comments found for this post." });
    }
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    if (commentId) {
      const comment = await Comment.findByIdAndUpdate(commentId, req.body, {
        new: true,
      });
      if (!comment) {
        return res.status(404).json({ message: "Comment was not found" });
      }
      res.status(200).json(comment);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createComment,
  getCommentsBySender,
  getCommentById,
  getCommentsByPost,
  updateComment,
  deleteComment,
};
