require("dotenv").config();
const { connectDB } = require("./utils/connectDb");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./docs/swagger.yaml");

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/post", require("./routes/posts_routes"));
app.use("/comment", require("./routes/comments_router"));
app.use("/user", require("./routes/users_router"));
app.use("/swagger-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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