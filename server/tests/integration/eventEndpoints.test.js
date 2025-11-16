/**
 * Integration Tests for Event and Registration Endpoints
 */
import request from "supertest";
import app from "../src/index.js";
import { connectDB, disconnectDB } from "../src/config/db.js";
import User from "../src/schemas/User.js";
import College from "../src/schemas/College.js";
import Club from "../src/schemas/Club.js";
import Event from "../src/schemas/Event.js";
import Registration from "../src/schemas/Registration.js";

describe("Event and Registration Endpoints", () => {
  let authToken;
  let userId;
  let collegeId;
  let clubId;
  let eventId;

  beforeAll(async () => {
    await connectDB();

    // Create user
    const userRes = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "SecurePass123@",
    });

    authToken = userRes.body.data.tokens.accessToken;
    userId = userRes.body.data.user._id;

    // Create college
    const college = await College.create({
      name: "Test College",
      domain: "college.edu",
      address: "123 Main St",
    });
    collegeId = college._id;

    // Update user with college
    await User.findByIdAndUpdate(userId, { collegeId });

    // Create club
    const club = await Club.create({
      name: "Test Club",
      slug: "test-club",
      collegeId,
      admins: [userId],
      members: [userId],
      membersCount: 1,
    });
    clubId = club._id;

    // Create event
    const event = await Event.create({
      title: "Test Event",
      clubId,
      startAt: new Date(Date.now() + 86400000), // Tomorrow
      endAt: new Date(Date.now() + 90000000),
      location: {
        name: "Test Location",
        coords: {
          type: "Point",
          coordinates: [0, 0],
        },
      },
      capacity: 10,
      status: "published",
      createdBy: userId,
    });
    eventId = event._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await College.deleteMany({});
    await Club.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await disconnectDB();
  });

  describe("POST /api/events/:id/register", () => {
    it("should register user for event", async () => {
      const response = await request(app)
        .post(`/api/events/${eventId}/register`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          userCoordinates: { lat: 40.7128, lng: -74.006 },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("registered");
    });

    it("should prevent duplicate registration", async () => {
      // First registration
      await request(app)
        .post(`/api/events/${eventId}/register`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      // Duplicate attempt
      const response = await request(app)
        .post(`/api/events/${eventId}/register`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe("ALREADY_REGISTERED");
    });

    it("should prevent registration when capacity reached", async () => {
      // Create event with 0 capacity
      const smallEvent = await Event.create({
        title: "Small Event",
        clubId,
        startAt: new Date(Date.now() + 86400000),
        endAt: new Date(Date.now() + 90000000),
        location: {
          name: "Test Location",
          coords: { type: "Point", coordinates: [0, 0] },
        },
        capacity: 0, // No capacity
        attendeesCount: 0,
        status: "published",
        createdBy: userId,
      });

      // Register first user
      const user2 = await User.create({
        name: "User 2",
        email: "user2@example.com",
        password: "SecurePass123@",
      });

      const user2Token = require("jsonwebtoken").sign(
        { userId: user2._id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "1h" }
      );

      await Registration.create({
        eventId: smallEvent._id,
        userId: user2._id,
        status: "registered",
      });

      // Increment attendees
      await Event.findByIdAndUpdate(smallEvent._id, {
        attendeesCount: 1,
        capacity: 1,
      });

      // Try to register another user
      const response = await request(app)
        .post(`/api/events/${smallEvent._id}/register`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("OVERBOOKED");
    });
  });

  describe("POST /api/events/:id/checkin", () => {
    let registrationId;

    beforeEach(async () => {
      const reg = await Registration.create({
        eventId,
        userId,
        status: "registered",
      });
      registrationId = reg._id;
    });

    it("should check in user", async () => {
      const response = await request(app)
        .post(`/api/events/${eventId}/checkin`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ registrationId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("checked-in");
    });
  });

  describe("POST /api/registrations/:id/request-eta", () => {
    let registrationId;

    beforeEach(async () => {
      const reg = await Registration.create({
        eventId,
        userId,
        status: "registered",
      });
      registrationId = reg._id;
    });

    it("should compute ETA for registration", async () => {
      const response = await request(app)
        .post(`/api/registrations/${registrationId}/request-eta`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          userCoordinates: { lat: 40.7128, lng: -74.006 },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});
