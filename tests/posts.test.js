const request = require("supertest");
const initApp = require("../server.js");
const mongoose = require("mongoose");
const postModel = require("../models/posts_model.js");

let app;
beforeAll(async () => {
  app = await initApp();
});
beforeEach(async () => {
  await postModel.deleteMany();
});

afterAll(async () => {
  mongoose.connection.close();
});

describe("Create post", () => {
  test("should create a new post", async () => {
    const newPost = {
      title: "test post",
      content: "test test test!!!",
      sender: "admin",
    };

    const response = await request(app).post("/post/createPost").send(newPost);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe(newPost.title);
  });

  test("should not create a post without required fields", async () => {
    const response = await request(app)
      .post("/post/createPost")
      .send({ sender: "admin" });

    expect(response.status).toBe(400);
    expect(response.text).toBe(
      "Post validation failed: title: Path `title` is required."
    );
  });
});

describe("get posts", () => {
  test("should retrieve all posts", async () => {
    await postModel.create({
      title: "test post 1",
      content: "first test post",
      sender: "admin",
    });
    await postModel.create({
      title: "test post 2",
      content: "second test post",
      sender: "admin",
    });

    const response = await request(app).get("/post/getAllPosts");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});

describe("get Post by ID", () => {
  test("should retrieve a post by ID", async () => {
    const post = await postModel.create({
      title: "test post",
      content: "test post for get post by id",
      sender: "admin",
    });

    const response = await request(app).get(`/post/${post._id}`);

    expect(response.status).toBe(200);
    expect(response.body.content).toBe(post.content);
  });
  test("should return 404 for a non-existent post ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/post/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.text).toBe("Post was not found");
  });
});

describe("get Post by Sender", () => {
  test("should retrieve all posts by sender", async () => {
    await postModel.create({
      title: "test post 1",
      content: "first test post",
      sender: "admin1",
    });
    await postModel.create({
      title: "test post 2",
      content: "second test post",
      sender: "admin2",
    });

    const response = await request(app).get(`/post/?sender=admin2`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test("should return 404 for a non-existent post sender", async () => {
    await postModel.create({
      title: "test post 1",
      content: "first test post",
      sender: "admin",
    });
    await postModel.create({
      title: "test post 2",
      content: "second test post",
      sender: "admin",
    });

    const response = await request(app).get(`/post/?sender=userWithoutPosts`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No posts found for this sender");
  });
});

describe("update Post", () => {
  test("should succesfully update post", async () => {
    const post = await postModel.create({
      title: "test post",
      content: "test post for get post by id",
      sender: "admin",
    });

    const updatedPost = {
      title: "test updated",
      content: "post updated succesfully!",
      sender: "admin",
    };

    const response = await request(app)
      .put(`/post/${post._id}`)
      .send(updatedPost)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.content).toBe(updatedPost.content);
  });

  test("should return 404 for a non-existent post id", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app).put(`/post/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Post not found");
  });
});
