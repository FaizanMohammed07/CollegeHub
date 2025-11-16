/**
 * Unit Tests for Auth Service
 */
import authService from "../src/services/authService.js";
import userRepository from "../src/repositories/userRepository.js";
import { AppError, ERROR_CODES } from "../src/utils/AppError.js";

jest.mock("../src/repositories/userRepository.js");

describe("AuthService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signup", () => {
    it("should create a new user and return tokens", async () => {
      const mockUser = {
        _id: "user123",
        toJSON: () => ({
          id: "user123",
          name: "Test User",
          email: "test@example.com",
        }),
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockUser);
      userRepository.updateRefreshToken.mockResolvedValue(mockUser);

      const result = await authService.signup(
        {
          name: "Test User",
          email: "test@example.com",
          password: "SecurePass123@",
        },
        "college123"
      );

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(userRepository.create).toHaveBeenCalled();
    });

    it("should throw error if email already exists", async () => {
      const existingUser = { email: "test@example.com" };
      userRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        authService.signup(
          {
            name: "Test",
            email: "test@example.com",
            password: "SecurePass123@",
          },
          "college123"
        )
      ).rejects.toThrow(AppError);
    });

    it("should throw error for weak password", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockRejectedValue(new Error("WEAK_PASSWORD"));

      await expect(
        authService.signup(
          { name: "Test", email: "test@example.com", password: "weak" },
          "college123"
        )
      ).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("should authenticate user and return tokens", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "$2a$10$hashedpassword",
        blocked: false,
        toJSON: () => ({ id: "user123" }),
      };

      userRepository.findByEmailWithPassword.mockResolvedValue(mockUser);
      userRepository.updateLastSeen.mockResolvedValue(mockUser);
      userRepository.updateRefreshToken.mockResolvedValue(mockUser);

      const result = await authService.login({
        email: "test@example.com",
        password: "SecurePass123@",
      });

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    it("should throw error for invalid credentials", async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        authService.login({
          email: "test@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow(AppError);
    });
  });
});
