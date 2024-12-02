const express = require("express");
const router = express.Router();
const userController = require("../controllers/users_controller");

router.post("/registerUser", userController.registerUser);

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUserById);

router.get("/email/:email", userController.getUserByEmail);

router.get("/username/:username", userController.getUserByUserName);

router.put("/:id", userController.updateUser);

router.delete("/:id", userController.deleteUser);

router.post("/login", userController.login);

router.post("/logout", userController.logout);

module.exports = router;
