/**
 * Database Seed Script
 * Run: npm run seed
 */
import "dotenv/config";
import { connectDB } from "../src/config/db.js";
import User from "../src/schemas/User.js";
import College from "../src/schemas/College.js";
import Club from "../src/schemas/Club.js";
import Event from "../src/schemas/Event.js";
import Registration from "../src/schemas/Registration.js";
import logger from "../src/utils/logger.js";

const seedDatabase = async () => {
  try {
    logger.info("Starting database seeding...");
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      College.deleteMany({}),
      Club.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
    ]);
    logger.info("Cleared existing data");

    // Create colleges
    const colleges = await College.insertMany([
      {
        name: "Stanford University",
        domain: "stanford.edu",
        address: "Stanford, CA 94305",
        contactEmail: "info@stanford.edu",
        contactPhone: "+16507232300",
      },
      {
        name: "MIT",
        domain: "mit.edu",
        address: "Cambridge, MA 02139",
        contactEmail: "info@mit.edu",
        contactPhone: "+16172531000",
      },
      {
        name: "UC Berkeley",
        domain: "berkeley.edu",
        address: "Berkeley, CA 94720",
        contactEmail: "info@berkeley.edu",
        contactPhone: "+15106426000",
      },
    ]);
    logger.info(`Created ${colleges.length} colleges`);

    // Create users with different roles
    const users = await User.insertMany([
      {
        name: "John Admin",
        email: "admin@stanford.edu",
        password: "SecurePass123@",
        role: "college_admin",
        collegeId: colleges[0]._id,
        isVerified: true,
      },
      {
        name: "Alice Student",
        email: "alice@stanford.edu",
        password: "SecurePass123@",
        role: "student",
        collegeId: colleges[0]._id,
        isVerified: true,
      },
      {
        name: "Bob Student",
        email: "bob@stanford.edu",
        password: "SecurePass123@",
        role: "student",
        collegeId: colleges[0]._id,
        isVerified: true,
      },
      {
        name: "Charlie Student",
        email: "charlie@mit.edu",
        password: "SecurePass123@",
        role: "student",
        collegeId: colleges[1]._id,
        isVerified: true,
      },
      {
        name: "Diana ClubAdmin",
        email: "diana@berkeley.edu",
        password: "SecurePass123@",
        role: "club_admin",
        collegeId: colleges[2]._id,
        isVerified: true,
      },
    ]);
    logger.info(`Created ${users.length} users`);

    // Create clubs
    const clubs = await Club.insertMany([
      {
        name: "Coding Club",
        slug: "coding-club",
        description: "Learn and share coding skills with fellow students",
        collegeId: colleges[0]._id,
        admins: [users[0]._id],
        members: [users[0]._id, users[1]._id, users[2]._id],
        membersCount: 3,
        verified: true,
        category: "technical",
      },
      {
        name: "Dance Club",
        slug: "dance-club",
        description: "Express yourself through dance",
        collegeId: colleges[0]._id,
        admins: [users[1]._id],
        members: [users[1]._id, users[2]._id],
        membersCount: 2,
        verified: true,
        category: "sports",
      },
      {
        name: "Tech Club",
        slug: "tech-club",
        description: "All things technology",
        collegeId: colleges[1]._id,
        admins: [users[3]._id],
        members: [users[3]._id],
        membersCount: 1,
        verified: true,
        category: "technical",
      },
      {
        name: "Art Club",
        slug: "art-club",
        description: "Creative expression through art",
        collegeId: colleges[2]._id,
        admins: [users[4]._id],
        members: [users[4]._id],
        membersCount: 1,
        verified: true,
        category: "cultural",
      },
    ]);
    logger.info(`Created ${clubs.length} clubs`);

    // Create events
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await Event.insertMany([
      {
        title: "Introduction to Web Development",
        description:
          "Learn the basics of web development with HTML, CSS, and JavaScript",
        clubId: clubs[0]._id,
        startAt: tomorrow,
        endAt: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
        location: {
          name: "Engineering Building",
          address: "Stanford Campus",
          coords: {
            type: "Point",
            coordinates: [-122.1697, 37.4419], // Stanford
          },
        },
        capacity: 30,
        attendeesCount: 2,
        status: "published",
        createdBy: users[0]._id,
        isPaid: false,
      },
      {
        title: "Dance Workshop",
        description: "Learn contemporary dance moves",
        clubId: clubs[1]._id,
        startAt: nextWeek,
        endAt: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000),
        location: {
          name: "Dance Studio",
          address: "Stanford Campus",
          coords: {
            type: "Point",
            coordinates: [-122.1697, 37.4419],
          },
        },
        capacity: 20,
        attendeesCount: 1,
        status: "published",
        createdBy: users[1]._id,
        isPaid: false,
      },
      {
        title: "AI/ML Hackathon",
        description: "Build AI-powered applications in 24 hours",
        clubId: clubs[2]._id,
        startAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        endAt: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        location: {
          name: "Tech Building",
          address: "MIT Campus",
          coords: {
            type: "Point",
            coordinates: [-71.0942, 42.3601], // MIT
          },
        },
        capacity: 50,
        attendeesCount: 0,
        status: "published",
        createdBy: users[3]._id,
        isPaid: true,
        priceInPaise: 50000, // ₹500
      },
      {
        title: "Art Exhibition Opening",
        description: "Showcase of student artwork",
        clubId: clubs[3]._id,
        startAt: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
        endAt: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        location: {
          name: "Art Gallery",
          address: "UC Berkeley Campus",
          coords: {
            type: "Point",
            coordinates: [-122.2596, 37.8716], // Berkeley
          },
        },
        capacity: 100,
        attendeesCount: 0,
        status: "published",
        createdBy: users[4]._id,
        isPaid: false,
      },
    ]);
    logger.info(`Created ${events.length} events`);

    // Create registrations
    const registrations = await Registration.insertMany([
      {
        eventId: events[0]._id,
        userId: users[1]._id,
        status: "registered",
        metadata: {},
      },
      {
        eventId: events[0]._id,
        userId: users[2]._id,
        status: "registered",
        metadata: {},
      },
      {
        eventId: events[1]._id,
        userId: users[1]._id,
        status: "registered",
        metadata: {},
      },
    ]);
    logger.info(`Created ${registrations.length} registrations`);

    logger.info("Database seeding completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Database seeding failed");
    process.exit(1);
  }
};

seedDatabase();
