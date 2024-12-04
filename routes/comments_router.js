const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comments_controller");

router.post("/createComment", commentController.createComment);

router.get("/", commentController.getCommentsBySender);

router.get("/comment_op/:id", commentController.getCommentById);

router.get("/post", commentController.getCommentsByPost);

router.put("/comment_op/:id", commentController.updateComment);

router.delete("/comment_op/:id", commentController.deleteComment);

module.exports = router;
