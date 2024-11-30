const express = require("express");
const app = express();
const port = process.env.PORT;

const mongoose = require("mongoose");
mongoose.connect(process.env.DB_CONNECT);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const postsRoute = require("./routes/posts_routes");
const commentRoute = require("./routes/comments_router");
app.use("/post", postsRoute);
app.use("/comment", commentRoute);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
