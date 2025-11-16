/**
 * Test Setup
 */
import "dotenv/config";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI =
  process.env.MONGODB_TEST_URI || "mongodb://localhost:27017/college-hub-test";
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.JWT_RESET_PASSWORD_SECRET = "test-reset-secret";
process.env.JWT_VERIFICATION_SECRET = "test-verification-secret";
