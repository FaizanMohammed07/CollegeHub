import userRepository from "../repositories/userRepository.js";
import { AppError, ERROR_CODES } from "../utils/AppError.js";
import logger from "../utils/logger.js";
import mapService from "./mapService.js";

/**
 * User Service
 * Handles user profile and related business logic
 */
export class UserService {
  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
    }

    return user.toJSON();
  }

  /**
   * Update user profile
   * Thin controller should handle minimal validation
   */
  async updateProfile(userId, updates) {
    // Prevent updating sensitive fields
    const allowedFields = ["name", "phone", "profilePicUrl"];
    const updateData = {};

    for (const field of allowedFields) {
      if (field in updates) {
        updateData[field] = updates[field];
      }
    }

    try {
      const user = await userRepository.update(userId, updateData);

      if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
      }

      logger.info(
        { userId, fields: Object.keys(updateData) },
        "User profile updated"
      );

      return user.toJSON();
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, userId }, "Failed to update user profile");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to update profile",
        500
      );
    }
  }

  /**
   * Update user location
   * Stores geolocation data
   */
  async updateLocation(userId, latitude, longitude) {
    try {
      // Validate coordinates
      mapService.validateCoordinates(latitude, longitude);

      const user = await userRepository.updateLocation(
        userId,
        latitude,
        longitude
      );

      if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
      }

      logger.info(
        { userId, lat: latitude, lng: longitude },
        "User location updated"
      );

      return user.toJSON();
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, userId }, "Failed to update location");
      throw new AppError(
        ERROR_CODES.INVALID_COORDINATES,
        "Invalid coordinates provided",
        400
      );
    }
  }

  /**
   * Find nearby users
   */
  async findNearbyUsers(latitude, longitude, maxDistance = 5000) {
    try {
      mapService.validateCoordinates(latitude, longitude);

      const users = await userRepository.findNearby(
        latitude,
        longitude,
        maxDistance
      );

      return users.map((u) => u.toJSON());
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error }, "Failed to find nearby users");
      throw new AppError(
        ERROR_CODES.INVALID_COORDINATES,
        "Invalid coordinates",
        400
      );
    }
  }

  /**
   * Search users
   */
  async searchUsers(query, limit = 20) {
    if (!query || query.trim().length < 2) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "Search query must be at least 2 characters",
        400
      );
    }

    try {
      const users = await userRepository.search(query, limit);
      return users.map((u) => u.toJSON());
    } catch (error) {
      logger.error({ error, query }, "User search failed");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to search users",
        500
      );
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
    }

    return user.toJSON();
  }

  /**
   * Block user (admin only)
   */
  async blockUser(userId, reason = "Violation of terms") {
    try {
      const user = await userRepository.findByIdAndBlock(userId, reason);

      if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
      }

      logger.warn({ userId, reason }, "User blocked");

      return {
        success: true,
        user: user.toJSON(),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to block user",
        500
      );
    }
  }

  /**
   * Unblock user (admin only)
   */
  async unblockUser(userId) {
    try {
      const user = await userRepository.findByIdAndUnblock(userId);

      if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
      }

      logger.info({ userId }, "User unblocked");

      return {
        success: true,
        user: user.toJSON(),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to unblock user",
        500
      );
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
      }

      // Would query registrations, posts, etc. in real implementation
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        eventsRegistered: 0, // Fetch from Registration collection
        clubsMemberships: 0, // Fetch from Club collection
        postsCreated: 0, // Fetch from Post collection
        lastSeen: user.lastSeenAt,
        memberSince: user.createdAt,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to fetch user statistics",
        500
      );
    }
  }
}

export default new UserService();
