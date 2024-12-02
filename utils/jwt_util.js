const jwt = require("jsonwebtoken");

const generateTokens = async (user) => {
    const MAX_NUMBER = 1000000;
    const accessToken = jwt.sign({ "_id": user._id }, process.env.TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
    const random = Math.floor(Math.random() * MAX_NUMBER).toString();
    const refreshToken = jwt.sign({ "_id": user._id, "random": random }, process.env.TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRATION});
    return {accessToken, refreshToken};
}

const updateCookies = (accessToken, refreshToken, res) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: process.env.ACCESS_TOKEN_EXPIRATION_MILLISECONDS
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: process.env.REFRESH_TOKEN_EXPIRATION_MILLISECONDS
    });
}

const clearCookies = (res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });
}

module.exports = {generateTokens, updateCookies, clearCookies}