const request = require("supertest");
const initApp = require("../server.js");
const mongoose = require("mongoose");
const userModel = require("../models/users_model");

let app;
beforeAll(async () => {
    app = await initApp();
});
beforeEach(async () => {
    await userModel.deleteMany();
});

afterAll(async () => {
    mongoose.connection.close();
});

// User Creation Tests
describe('Create User', () => {
    describe('POST /registerUser', () => {
        it('should create a new user', async () => {
            const newUser = {
                username: 'osher',
                email: 'osher@example.com',
                password: 'Password123!',
            };

            const response = await request(app).post('/user/registerUser').send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.username).toBe(newUser.username);
        });

        it('should not create a user without required fields', async () => {
            const response = await request(app).post('/user/registerUser').send({ username: 'incomplete-user' });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });

        it('should not create a user with an invalid email', async () => {
            const response = await request(app).post('/user/registerUser').send({
                username: 'invalidemailuser',
                email: 'not-an-email',
                password: 'Password123!',
            });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });

        it('should not create a user with duplicate email', async () => {
            const user = { username: 'user1', email: 'test@example.com', password: 'Password123!' };
            await userModel.create(user);

            const response = await request(app).post('/user/registerUser').send(user);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('User already exists.');
        });
    });
});

// User Read Tests
describe('Read User', () => {
    describe('GET /', () => {
        it('should retrieve all users', async () => {
            await userModel.create({ username: 'user1', email: 'user1@example.com', password: 'Password123!' });
            await userModel.create({ username: 'user2', email: 'user2@example.com', password: 'Password123!' });

            const response = await request(app).get('/user');

            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
        });

        describe("when there are no users", () => {
            it("should return an empty array", async () => {
                const response = await request(app).get("/user");

                expect(response.statusCode).toBe(200);
                expect(response.body).toBeInstanceOf(Array);
                expect(response.body).toHaveLength(0);
            });
        });

        describe("mongo failure", () => {
            it("should return 500 when there is a server error", async () => {
                jest.spyOn(userModel, "find").mockRejectedValue(new Error("Server error"));

                const response = await request(app).get("/user");

                expect(response.statusCode).toBe(500);
                expect(response.body).toHaveProperty("error");
            });
        });
    });

    describe('GET /:id', () => {
        it('should retrieve a user by ID', async () => {
            const user = await userModel.create({
                username: 'osher',
                email: 'test@example.com',
                password: 'Password123!'
            });

            const response = await request(app).get(`/user/${user._id}`);

            expect(response.status).toBe(200);
            expect(response.body.username).toBe(user.username);
        });

        it('should return 404 for a non-existent user ID', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();

            const response = await request(app).get(`/user/${nonExistentId}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('User not found.');
        });

        it('should return 400 for invalid user ID format', async () => {
            const response = await request(app).get('/user/invalid-id-format');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
});

// Authentication Tests
describe('Authentication', () => {
    let users = [];
    const testUsers = [
        { username: "Alik", email: "testuser@gmail.com", password: "password123" },
        { username: "Osher", email: "anotherOne@gmail.com", password: "password" },
    ];

    beforeEach(async () => {
        users = await userModel.create(testUsers);
    });

    describe('POST /user/login', () => {
        it('should return tokens for valid credentials', async () => {
            const response = await request(app)
                .post('/user/login')
                .send({ username: "Alik", email: "testuser@gmail.com", password: "password123" });

            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies.length).toBeGreaterThan(0);
            const accessTokenCookie = cookies.find(cookie => cookie.startsWith('accessToken='));
            expect(accessTokenCookie).toBeDefined();
            const cookieValue = accessTokenCookie.split('=')[1].split(';')[0];
            expect(cookieValue).toBeTruthy();
        });

        it("should return 400 when wrong credentials", async () => {
            const response = await request(app).post("/user/login").send({
                username: "Alik",
                email: "alikkkkkk@gmail.com",
                password: "ppaassword"
            });

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("error");
        });

        it('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/user/login')
                .send({ username: 'testuser' }); // No password

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /user/logout', () => {
        it('should return a response with a empty cookie after user is logged out', async () => {
            const response = await request(app).post("/user/logout").send({});
            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies.length).toBeGreaterThan(0);
            const accessTokenCookie = cookies.find(cookie => cookie.startsWith('accessToken='));
            expect(accessTokenCookie).toBeDefined();
            const cookieValue = accessTokenCookie.split('=')[1].split(';')[0];
            expect(cookieValue).toBe('');
        });
    });
});

// Update User Tests
describe('Update User', () => {
    describe('PUT /user/:id', () => {
        it('should update a user by ID', async () => {
            const user = await userModel.create({
                username: 'osher',
                email: 'test@example.com',
                password: 'Password123!',
            });

            const updatedData = { username: 'osher_updated' };
            const response = await request(app).put(`/user/${user._id}`).send(updatedData);

            expect(response.status).toBe(200);
            expect(response.body.username).toBe(updatedData.username);
        });

        it('should return 404 if user not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app).put(`/user/${nonExistentId}`).send({ username: 'newName' });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('User not found.');
        });

        it('should return 400 for invalid user ID format', async () => {
            const response = await request(app).put('/user/invalid-id').send({ username: 'newName' });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 500 for invalid update data', async () => {
            const user = await userModel.create({
                username: 'osher',
                email: 'test@example.com',
                password: 'Password123!',
            });

            const response = await request(app).put(`/user/${user._id}`).send({});

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 500 if username already exists', async () => {
            await userModel.create({
                username: 'existing_user',
                email: 'existing@example.com',
                password: 'Password123!',
            });

            const user = await userModel.create({
                username: 'osher',
                email: 'test@example.com',
                password: 'Password123!',
            });

            const response = await request(app).put(`/user/${user._id}`).send({ username: 'existing_user' });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
});

// Delete User Tests
describe('Delete User', () => {
    describe('DELETE /user/:id', () => {
        it('should delete a user by ID', async () => {
            const user = await userModel.create({
                username: 'osher',
                email: 'test@example.com',
                password: 'Password123!',
            });

            const response = await request(app).delete(`/user/${user._id}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User deleted successfully');

            const deletedUser = await userModel.findById(user._id);
            expect(deletedUser).toBeNull();
        });

        it('should return 404 if user not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app).delete(`/user/${nonExistentId}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('User not found');
        });

        it('should return 500 for invalid user ID format', async () => {
            const response = await request(app).delete('/user/invalid-id');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
});

// Get User by Username Tests
describe('Get User by Username', () => {
    describe('GET /user/username/:username', () => {
        it('should retrieve a user by username', async () => {
            const user = await userModel.create({
                username: 'osher',
                email: 'test@example.com',
                password: 'Password123!',
            });

            const response = await request(app).get(`/user/username/${user.username}`);

            expect(response.status).toBe(200);
            expect(response.body.username).toBe(user.username);
        });

        it('should return 404 if user not found', async () => {
            const response = await request(app).get('/user/username/nonexistentuser');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('User not found.');
        });

        it('should return 500 if an internal server error occurs', async () => {
            jest.spyOn(userModel, 'findOne').mockImplementation(() => {
                throw new Error('Database error');
            });

            const response = await request(app).get('/user/username/testuser');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
});

// Get User by Email Tests
describe('Get User by Email', () => {
    describe('GET /user/email/:email', () => {
        it('should retrieve a user by email', async () => {
            const user = await userModel.create({
                username: 'osher',
                email: 'test@example.com',
                password: 'Password123!',
            });

            const response = await request(app).get('/user/email/test@example.com');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({
                email: user.email,
            }));
        });
        it('should return 500 if user not exist', async () => {
            const response = await request(app).get('/user/email/nonexistent@example.com');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });

        it('should return 500 for invalid email format', async () => {
            const response = await request(app).get('/user/email/invalid-email');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
});

describe('Logout', () => {
    describe('POST /logout', () => {
        it('should successfully log out the user', async () => {

            const user = await userModel.create({
                username: 'osher',
                email: 'test@example.com',
                password: 'Password123!',
            });

            const loginResponse = await request(app)
                .post('/user/login')
                .send({ username: user.username, password: 'Password123!' });

            expect(loginResponse.status).toBe(200);
            const token = loginResponse.body.token;

            // Call the logout endpoint
            const response = await request(app)
                .post('/user/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Logout successful.');
        });

        it('should return 500 if there is a logout error', async () => {
            jest.spyOn(userModel, 'updateOne').mockImplementation(() => {
                throw new Error('Logout failed');
            });
            const response = await request(app).post('/user/logout');
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'An error occurred while logging out.');
        });
    });
});
