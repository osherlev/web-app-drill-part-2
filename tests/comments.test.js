const request = require("supertest");
const initApp = require("../server.js");
const mongoose = require("mongoose");
const commentModel = require("../models/comments_model.js");
const postModel = require("../models/posts_model.js");

let app;
beforeAll(async () => {
  app = await initApp();
});
beforeEach(async () => {
  await commentModel.deleteMany();
});
afterEach(async () => {
  jest.restoreAllMocks();
});
afterAll(async () => {
  mongoose.connection.close();
});

describe("Create comment", () => {
  test("should create a new comment", async () => {
    const post = await postModel.create({
      title: "test post",
      content: "test post for get post by id",
      sender: "admin",
    });

    const newComment = {
      sender: "admin",
      postId: post._id,
      content: "test comment",
    };

    const response = await request(app)
      .post("/comment/createComment")
      .send(newComment);

    expect(response.status).toBe(201);
    expect(response.body.comment.content).toBe(newComment.content);
  });
  test('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/comment/createComment')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({error: "All fields are required: postId, sender, content"});
  })
  test('should return 500 if there is an error during fetching comments', async () => {
    jest.spyOn(commentModel, 'create').mockImplementation(() => {
      throw new Error('createComment failed');
    });
    const response = await request(app).post('/comment/createComment').send({sender:"test", postId:"test", content:"test"});
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('createComment failed');;
  });
});

describe("get comments", () => {
  test("should retrieve all comments", async () => {
    const post = await postModel.create({
      title: "test post",
      content: "test post for get all comments",
      sender: "admin",
    });
    await commentModel.create({
      sender: "admin1",
      postId: post._id,
      content: "test comment",
    });
    await commentModel.create({
      sender: "admin2",
      postId: post._id,
      content: "test comment",
    });

    const response = await request(app).get("/comment");

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});

describe("get comment by ID", () => {
  test("should retrieve a comment by ID", async () => {
    const post = await postModel.create({
      title: "test post",
      content: "test post for get comment by id",
      sender: "admin",
    });
    const comment = await commentModel.create({
      sender: "admin2",
      postId: post._id,
      content: "test comment",
    });

    const response = await request(app).get(`/comment/comment_op/${comment._id}`);

    expect(response.status).toBe(200);
    expect(response.body.content).toBe(comment.content);
  });
  test("should return 404 for a non-existent comment ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/comment/comment_op/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.text).toBe("Comment was not found");
  });
  test('should return 400 if there is an error during fetching comments', async () => {
    jest.spyOn(commentModel, 'findById').mockImplementation(() => {
      throw new Error('getCommentsById failed');
    });
    const response = await request(app).get('/comment/comment_op/a');
    expect(response.status).toBe(400);
    expect(response.text).toBe('getCommentsById failed');;
  });
});

describe("get comments by Post", () => {
  test("should retrieve all comments by Post", async () => {
    const post = await postModel.create({
      title: "test post",
      content: "test post for get comment by id",
      sender: "admin",
    });
    await commentModel.create({
      sender: "admin2",
      postId: post._id,
      content: "test comment 1",
    });
    await commentModel.create({
      sender: "admin1",
      postId: post._id,
      content: "test comment 2",
    });

    const response = await request(app).get(`/comment/post?post_id=${post._id}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
  test("should return 404 for a non-existent post ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/comment/post?post_id=${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No comments found for this post.");
  });
  test("should return 400 for a required post ID", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/comment/post?post_id=`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Post ID is required.");
  });
  test('should return 500 if there is an error during fetching comments', async () => {
    jest.spyOn(commentModel, 'find').mockImplementation(() => {
      throw new Error('getCommentsByPost failed');
    });
    const response = await request(app).get('/comment/post?post_id=test');
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('getCommentsByPost failed');;
  });
});

describe("get comment by Sender", () => {
  test("should retrieve all comments by sender", async () => {
    const post = await postModel.create({
      title: "test post",
      content: "test post for get all comments",
      sender: "admin",
    });
    await commentModel.create({
      sender: "admin1",
      postId: post._id,
      content: "test comment 1",
    });
    await commentModel.create({
      sender: "admin2",
      postId: post._id,
      content: "test comment 2",
    });

    const response = await request(app).get(`/comment/?sender=admin2`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  test("should return all comments after not found sender", async () => {
    const post = await postModel.create({
      title: "test post",
      content: "test post for get all comments",
      sender: "admin",
    });
    await commentModel.create({
      sender: "admin1",
      postId: post._id,
      content: "test comment 1",
    });
    await commentModel.create({
      sender: "admin2",
      postId: post._id,
      content: "test comment 2",
    });

    const response = await request(app).get(`/comment/?sender=`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
  test('should return 400 if there is an error during fetching comments', async () => {
    jest.spyOn(commentModel, 'find').mockImplementation(() => {
      throw new Error('getCommentsBySender failed');
    });
    const response = await request(app).get('/comment/?sender="test"');
    expect(response.status).toBe(400);
    expect(response.text).toBe('getCommentsBySender failed');;
  });
});

describe("update comment", () => {
  test("should succesfully update comment", async () => {
    const post = await postModel.create({
      title: "test post",
      content: "test post",
      sender: "admin",
    });
    const comment = await commentModel.create({
      sender: "admin1",
      postId: post._id,
      content: "test comment",
    });

    const updatedComment = {
      sender: "admin1",
      postId: post._id,
      content: "test comment updated",
    };

    const response = await request(app)
      .put(`/comment/comment_op/${comment._id}`)
      .send(updatedComment)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.content).toBe(updatedComment.content);
  });

  test("should return 404 for a non-existent comment id", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app).put(`/comment/comment_op/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Comment was not found");
  });
  test('should return 500 if there is an error during fetching comments', async () => {
    jest.spyOn(commentModel, 'findByIdAndUpdate').mockImplementation(() => {
      throw new Error('updateComment failed');
    });
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app).put(`/comment/comment_op/${nonExistentId}`);
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('updateComment failed');;
  });
});

describe("delete comment", () => {
  test("should succesfully delete comment", async () => {
    const post = await postModel.create({
      title: "test post",
      content: "test post",
      sender: "admin",
    });
    const comment = await commentModel.create({
      sender: "admin1",
      postId: post._id,
      content: "test comment",
    });

    const response = await request(app).delete(`/comment/comment_op/${comment._id}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Comment deleted successfully");
  });

  test("should return 404 for a non-existent comment id", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app).delete(`/comment/comment_op/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Comment not found");
  });
  test('should return 500 if there is an error during fetching comments', async () => {
    jest.spyOn(commentModel, 'findByIdAndDelete').mockImplementation(() => {
      throw new Error('deleteComment failed');
    });
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app).delete(`/comment/comment_op/${nonExistentId}`);
    expect(response.status).toBe(500);
    expect(response.body.error).toBe('deleteComment failed');;
  });
});