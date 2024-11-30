const express = require("express");
const router = express.Router();
const postController = require("../controllers/posts_controller");

router.post("/createPost", postController.createPost);

router.get("/getAllPosts", postController.getAllPosts);

router.get("/:id", postController.getPostById);

router.get("/", postController.getPostsBySender);

router.put("/:id", postController.updatePost);

module.exports = router;
