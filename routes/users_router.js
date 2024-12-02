const express = require("express");
const router = express.Router();
const userController = require("../controllers/users_controller");

router.post("/registerUser", userController.registerUser);

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUserById);

router.post("/login",userController.login);

router.post("/logout", userController.logout);
module.exports = router;
