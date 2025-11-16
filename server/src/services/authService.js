import userRepository from "../repositories/userRepository.js";
import { comparePassword, hashPassword } from "../utils/security.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateResetPasswordToken,
  verifyResetPasswordToken,
  generateVerificationToken,
} from "../utils/jwt.js";
import revocationService from "./revocationService.js";
import { AppError, ERROR_CODES } from "../utils/AppError.js";
import logger from "../utils/logger.js";

/**
 * Auth Service
 * Handles all authentication business logic
 */
export class AuthService {
  /**
   * Sign up a new user
   * Validates email domain if college domain provided
   */
  async signup(signupData, collegeId = null) {
    const { name, email, password, phone } = signupData;

    if (!collegeId) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "College is required to create an account",
        400
      );
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError(
        ERROR_CODES.USER_ALREADY_EXISTS,
        "An account with this email already exists",
        409
      );
    }

    // Create user
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      collegeId,
    };

    if (phone) {
      userData.phone = phone;
    }

    try {
      const user = await userRepository.create(userData);
      await user.populate("collegeId", "name logoUrl address domain");

      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Store refresh token
      await userRepository.updateRefreshToken(user._id, refreshToken, 1);

      // Return tokens and user info
      return {
        user: user.toJSON(),
        accessToken,
        refreshToken,
        tokenType: "Bearer",
      };
    } catch (error) {
      if (error.code === "WEAK_PASSWORD") {
        throw new AppError(ERROR_CODES.WEAK_PASSWORD, error.message, 400);
      }

      if (error.code === 11000) {
        throw new AppError(
          ERROR_CODES.USER_ALREADY_EXISTS,
          "Email already registered",
          409
        );
      }

      logger.error({ error, email }, "Signup failed");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to create user account",
        500
      );
    }
  }

  /**
   * Login user
   * Verifies credentials and issues tokens
   */
  async login(loginData) {
    const { email, password } = loginData;

    // Find user with password field
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new AppError(
        ERROR_CODES.INVALID_CREDENTIALS,
        "Invalid email or password",
        401
      );
    }

    // Check if user is blocked
    if (user.blocked) {
      throw new AppError(
        ERROR_CODES.USER_BLOCKED,
        "Your account has been blocked",
        403
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(
        ERROR_CODES.INVALID_CREDENTIALS,
        "Invalid email or password",
        401
      );
    }

    // Update last seen
    await userRepository.updateLastSeen(user._id);

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token with rotation (increment version)
    const tokenVersion = (user.refreshTokenVersion || 0) + 1;
    await userRepository.updateRefreshToken(
      user._id,
      refreshToken,
      tokenVersion
    );

    await user.populate("collegeId", "name logoUrl address domain");

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      tokenType: "Bearer",
    };
  }

  /**
   * Refresh access token
   * Validates refresh token and issues new access token + optionally new refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      const userId = decoded.userId;

      // Check if token is revoked
      if (revocationService.isRevoked(refreshToken)) {
        throw new AppError(
          ERROR_CODES.TOKEN_REVOKED,
          "Refresh token has been revoked",
          401
        );
      }

      // Verify token matches stored token and version
      const user = await userRepository.getRefreshTokenInfo(userId);
      if (!user || user.lastRefreshToken !== refreshToken) {
        throw new AppError(
          ERROR_CODES.INVALID_TOKEN,
          "Invalid refresh token",
          401
        );
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(userId);

      // Optionally rotate refresh token (implement token rotation)
      const newRefreshToken = generateRefreshToken(userId);
      const newVersion = user.refreshTokenVersion + 1;

      // Revoke old refresh token
      revocationService.revokeToken(refreshToken);

      // Store new refresh token
      await userRepository.updateRefreshToken(
        userId,
        newRefreshToken,
        newVersion
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenType: "Bearer",
      };
    } catch (error) {
      if (error instanceof AppError) throw error;

      if (error.message === "REFRESH_TOKEN_EXPIRED") {
        throw new AppError(
          ERROR_CODES.EXPIRED_TOKEN,
          "Refresh token has expired",
          401
        );
      }

      if (error.message === "INVALID_REFRESH_TOKEN") {
        throw new AppError(
          ERROR_CODES.INVALID_TOKEN,
          "Invalid refresh token",
          401
        );
      }

      logger.error({ error }, "Token refresh failed");
      throw new AppError(
        ERROR_CODES.INVALID_TOKEN,
        "Token refresh failed",
        401
      );
    }
  }

  /**
   * Logout user
   * Revokes refresh token and invalidates session
   */
  async logout(userId, refreshToken) {
    try {
      // Revoke the refresh token
      if (refreshToken) {
        revocationService.revokeToken(refreshToken);
      }

      // Optionally: invalidate all sessions by incrementing token version
      // await userRepository.incrementTokenVersion(userId);

      logger.info({ userId }, "User logged out");
      return { success: true };
    } catch (error) {
      logger.error({ error, userId }, "Logout failed");
      throw new AppError(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        "Logout failed",
        500
      );
    }
  }

  /**
   * Request password reset
   * Generates reset token and returns it (in real app, send via email)
   */
  async requestPasswordReset(email) {
    const user = await userRepository.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      logger.info({ email }, "Password reset requested for non-existent email");
      return {
        success: true,
        message:
          "If an account exists with this email, you will receive a reset link",
      };
    }

    // Generate reset token
    const resetToken = generateResetPasswordToken(user._id, user.email);

    // In production: send email with token
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    logger.info({ email }, "Password reset requested");

    return {
      success: true,
      message: "Password reset email sent",
      token: resetToken, // In production, don't return this; send via email only
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetToken, newPassword) {
    try {
      // Verify token
      const decoded = verifyResetPasswordToken(resetToken);
      const userId = decoded.userId;

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await userRepository.update(userId, { password: hashedPassword });

      // Revoke all refresh tokens by incrementing version
      const user = await userRepository.getRefreshTokenInfo(userId);
      await userRepository.updateRefreshToken(
        userId,
        null,
        user.refreshTokenVersion + 1
      );

      logger.info({ userId }, "Password reset successful");

      return {
        success: true,
        message: "Password has been reset successfully",
      };
    } catch (error) {
      if (error.message === "RESET_TOKEN_EXPIRED") {
        throw new AppError(
          ERROR_CODES.EXPIRED_TOKEN,
          "Reset token has expired",
          400
        );
      }

      logger.error({ error }, "Password reset failed");
      throw new AppError(
        ERROR_CODES.INVALID_TOKEN,
        "Invalid or expired reset token",
        400
      );
    }
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
    }

    if (user.isVerified) {
      return {
        success: true,
        message: "Email already verified",
      };
    }

    // Generate verification token
    const verificationToken = generateVerificationToken(user._id, user.email);

    // In production: send email with token
    // await emailService.sendVerificationEmail(user.email, verificationToken);

    logger.info({ userId }, "Email verification requested");

    return {
      success: true,
      message: "Verification email sent",
      token: verificationToken, // In production, don't return; send via email
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(verificationToken) {
    try {
      const decoded = verifyVerificationToken(verificationToken);
      const userId = decoded.userId;

      const user = await userRepository.verifyEmail(userId);

      logger.info({ userId }, "Email verified");

      return {
        success: true,
        user: user.toJSON(),
      };
    } catch (error) {
      if (error.message === "VERIFICATION_TOKEN_EXPIRED") {
        throw new AppError(
          ERROR_CODES.EXPIRED_TOKEN,
          "Verification token has expired",
          400
        );
      }

      throw new AppError(
        ERROR_CODES.INVALID_TOKEN,
        "Invalid verification token",
        400
      );
    }
  }
}

export default new AuthService();
