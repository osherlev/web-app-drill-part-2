const User = require("../models/users_model");
const token = require("../utils/jwt_util");
const bcrypt = require("bcrypt");

const registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        const userExists = await User.findOne({email});

        if (userExists) {
            return res.status(400).json({error: "User already exists."});
        }
        const user = await User.create({username, email, password});
        res.status(201).json({id: user._id, username: user.username, email: user.email});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password");
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id, "-password");
        if (!user) {
            return res.status(404).json({error: "User not found."});
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
};
const getUserByEmail = async (req, res) => {
    const email = req.params.email;
    if (!validateEmail(email)) {
        return res.status(500).json({error: 'Invalid email format'});
    }
    try {
        const user = await User.findOne({email: email}, "-password");
        if (!user) {
            return res.status(404).json({error: "User not found."});
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
};

const getUserByUserName = async (req, res) => {
    try {
        const user = await User.findOne(
            {username: req.params.username},
            "-password"
        );
        if (!user) {
            return res.status(404).json({error: 'User not found.'});
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
};
const updateUser = async (req, res) => {
    try {
        const {id} = req.params;
        const updates = req.body;

        if (updates.password) {
            if (!updates.password.trim()) {
                return res.status(400).json({error: 'Password cannot be empty.'});
            }
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }
        const user = await User.findByIdAndUpdate(id, updates, {new: true, runValidators: true});
        if (!user) {
            return res.status(404).json({error: 'User not found.'});
        }

        res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({error: "User not found"});
        }
        return res.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        return res.status(500).json({error: error.message});
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
        return res.status(400).json({error: "An error occurred while logging in.", err});
    }
}

const logout = async (req, res) => {
    try {
        token.clearCookies(res);
        return res.status(200).json({message: "logged out successfully."});
    } catch (err) {
        return res.status(500).json({error: "An error occurred while logging out.", err});
    }
}

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

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
