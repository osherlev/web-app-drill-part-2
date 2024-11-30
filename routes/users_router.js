const express = require("express");
const router = express.Router();
const userController = require("../controllers/users_controller");

router.post("/registerUser", userController.registerUser);

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUserById);

module.exports = router;
