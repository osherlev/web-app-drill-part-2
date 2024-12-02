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

describe('Create User', () => {
    describe('POST /registerUser', () => {
        test('should create a new user', async () => {
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
        test('should not create a user without required fields', async () => {
            const response = await request(app).post('/user/registerUser').send({username: 'incomplete-user'});

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
        test('should not create a user with an invalid email', async () => {
            const response = await request(app).post('/user/registerUser').send({
                username: 'invalidemailuser',
                email: 'not-an-email',
                password: 'Password123!',
            });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });

        test('should not create a user with duplicate email', async () => {
            const user = {username: 'user1', email: 'test@example.com', password: 'Password123!'};
            await userModel.create(user);

            const response = await request(app).post('/user/registerUser').send(user);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User already exists.');
        });
    });
});

describe('GET /', () => {
    test('should retrieve all users', async () => {
        await userModel.create({username: 'user1', email: 'user1@example.com', password: 'Password123!'});
        await userModel.create({username: 'user2', email: 'user2@example.com', password: 'Password123!'});

        const response = await request(app).get('/user');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });
});

describe('Read User', () => {
    describe('GET /:id', () => {
        test('should retrieve a user by ID', async () => {
            const user = await userModel.create({
                username: 'osher',
                email: 'test@example.com',
                password: 'Password123!'
            });

            const response = await request(app).get(`/user/${user._id}`);

            expect(response.status).toBe(200);
            expect(response.body.username).toBe(user.username);
        });
        test('should return 404 for a non-existent user ID', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();

            const response = await request(app).get(`/user/${nonExistentId}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found.');
        });
        test('should return 400 for invalid user ID format', async () => {
            const response = await request(app).get('/user/invalid-id-format');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });
    });
});

const testUsers = [
    {username: "Alik", email: "testuser@gmail.com", password: "password123"},
    {username: "Osher", email: "anotherOne@gmail.com", password: "password"},
];

describe('Authentication Tests', () => {
    let savedUsers = [];
    beforeEach(async () => {
        savedUsers = await userModel.create(testUsers);
    });
    describe('POST /user/login', () => {

        it('should return tokens for valid credentials', async () => {
            const response = await request(app)
                .post('/user/login')
                .send({username: "Alik", email: "testuser@gmail.com", password: "password123"});

            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies.length).toBeGreaterThan(0);
            const accessTokenCookie = cookies.find(cookie => cookie.startsWith('accessToken='));
            expect(accessTokenCookie).toBeDefined();
            const cookieValue = accessTokenCookie.split('=')[1].split(';')[0];
            expect(cookieValue).toBeTruthy();
        });

        it("should return 400 when wrong credentials", async () => {
            const username = "Alik";
            const email = "alikkkkkk@gmail.com";
            const password = "ppaassword"
            const response = await request(app).post("/user/login").send({
                username,
                email,
                password
            });

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
        it('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/user/login')
                .send({username: 'testuser'}); // No password

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
            expect(cookieValue).toBe('')
        });
    });
});