/**
 * Jest Configuration
 */
module.exports = {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/index.js"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
