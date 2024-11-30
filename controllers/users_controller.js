const User = require("../models/user_model");

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



module.exports = {registerUser, getAllUsers, getUserById}