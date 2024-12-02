const User = require("../models/users_model");
const token = require("../utils/jwt_util");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        const userExists = await User.findOne({email});

        if (userExists) {
            return res.status(400).json({message: "User already exists."});
        }
        const user = await User.create({username, email, password});
        res.status(201).json({id: user._id, username: user.username, email: user.email});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id, "-password");
        if (!user) {
            return res.status(404).json({message: "User not found."});
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};
const getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }, "-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserByUserName = async (req, res) => {
    try {
        const user = await User.findOne(
            { username: req.params.username },
            "-password"
        );
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const updateUser = async (req, res) => {
    try {
        const updatedData = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, updatedData, {
            new: true,
        });
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
    try {
        const {username, password} = req.body;
        const existingUser = await User.findOne({username});
        const isMatchedPassword = await bcrypt.compare(password, existingUser?.password);
        if (!isMatchedPassword) {
            return res.status(400).json({error: "Invalid username or password."});
        }
        const {accessToken, refreshToken} = await token.generateTokens(existingUser);
        token.updateCookies(accessToken, refreshToken, res);
        return res.status(200).json({message: "logged in successfully."});
    } catch (err) {
        console.warn("Error while logging in:", err);
        return res.status(400).json({error: "An error occurred while logging in.", err});
    }
}

const logout = async (req, res) => {
    try {
        token.clearCookies(res);
        return res.status(200).json({message: "logged out successfully."});
    } catch (err) {
        console.warn("Error while logging out:", err);
        return res.status(500).json({error: "An error occurred while logging out.", err});
    }
}

module.exports = {
  registerUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByUserName,
  updateUser,
  deleteUser,
  login,
  logout,
};
