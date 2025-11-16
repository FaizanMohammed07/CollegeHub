/**
 * Integration Tests for Auth Endpoints
 */
import request from "supertest";
import app from "../src/index.js";
import { connectDB, disconnectDB } from "../src/config/db.js";
import User from "../src/schemas/User.js";

describe("Auth Endpoints", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnectDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/signup", () => {
    it("should create a new user account", async () => {
      const response = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123@",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it("should reject duplicate emails", async () => {
      await request(app).post("/api/auth/signup").send({
        name: "User 1",
        email: "duplicate@example.com",
        password: "SecurePass123@",
      });

      const response = await request(app).post("/api/auth/signup").send({
        name: "User 2",
        email: "duplicate@example.com",
        password: "SecurePass123@",
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("USER_ALREADY_EXISTS");
    });

    it("should validate password strength", async () => {
      const response = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "weak", // Too weak
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123@",
      });
    });

    it("should authenticate user with correct credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "SecurePass123@",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("POST /api/auth/refresh", () => {
    let refreshToken;

    beforeEach(async () => {
      const response = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123@",
      });

      refreshToken = response.body.data.tokens.refreshToken;
    });

    it("should issue new access token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it("should reject invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid_token" });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    let accessToken;

    beforeEach(async () => {
      const response = await request(app).post("/api/auth/signup").send({
        name: "Test User",
        email: "test@example.com",
        password: "SecurePass123@",
      });

      accessToken = response.body.data.tokens.accessToken;
    });

    it("should logout user and revoke token", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
