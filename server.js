require("dotenv").config();
const { connectDB } = require("./connectDb");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/post", require("./routes/posts_routes"));
app.use("/comment", require("./routes/comments_router"));
app.use("/user", require("./routes/users_router"));

const initApp = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await connectDB();
            resolve(app);
        } catch (err) {
            reject(err);
        }
    });
};
module.exports = initApp;