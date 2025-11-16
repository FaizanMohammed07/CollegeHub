import clubRepository from "../repositories/clubRepository.js";
import userRepository from "../repositories/userRepository.js";
import eventRepository from "../repositories/eventRepository.js";
import { AppError, ERROR_CODES } from "../utils/AppError.js";
import logger from "../utils/logger.js";

/**
 * Club Service
 * Handles club business logic and member management
 */
export class ClubService {
  /**
   * Create a new club
   * Only college_admin and super_admin can create
   */
  async createClub(creatorId, clubData, collegeId) {
    const { name, slug, description, category, logoUrl } = clubData;

    try {
      // Verify creator has permission
      const creator = await userRepository.findById(creatorId);
      if (!creator) {
        throw new AppError(
          ERROR_CODES.USER_NOT_FOUND,
          "Creator not found",
          404
        );
      }

      const allowedRoles = ["college_admin", "super_admin", "club_admin"];
      if (!allowedRoles.includes(creator.role)) {
        throw new AppError(
          ERROR_CODES.INSUFFICIENT_ROLE,
          "You do not have permission to create clubs",
          403
        );
      }

      // Check if slug is unique within college
      const existingClub = await clubRepository.findBySlug(slug, collegeId);
      if (existingClub) {
        throw new AppError(
          ERROR_CODES.RESOURCE_ALREADY_EXISTS,
          "A club with this slug already exists in your college",
          409
        );
      }

      // Create club
      const club = await clubRepository.create({
        name,
        slug: slug.toLowerCase(),
        description,
        category,
        logoUrl,
        collegeId,
        admins: [creatorId],
        members: [creatorId],
        membersCount: 1,
      });

      logger.info({ creatorId, clubId: club._id, collegeId }, "Club created");

      return club;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.code === 11000) {
        throw new AppError(
          ERROR_CODES.RESOURCE_ALREADY_EXISTS,
          "A club with this name or slug already exists",
          409
        );
      }
      logger.error({ error, creatorId }, "Failed to create club");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to create club",
        500
      );
    }
  }

  /**
   * Get club details
   */
  async getClubDetails(clubId) {
    try {
      const club = await clubRepository.findById(clubId);

      if (!club) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Club not found",
          404
        );
      }

      const [upcomingEvents] = await Promise.all([
        eventRepository.findByClub(clubId, 10, 0),
      ]);

      const clubData = club.toObject({ virtuals: true });
      if (clubData.collegeId && typeof clubData.collegeId === "object") {
        clubData.college = clubData.collegeId;
      }
      clubData.events = upcomingEvents;
      clubData.stats = {
        members: club.members?.length || club.membersCount || 0,
        admins: club.admins?.length || 0,
        upcomingEvents: upcomingEvents.length,
      };

      return clubData;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, clubId }, "Failed to get club details");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to fetch club details",
        500
      );
    }
  }

  /**
   * Update club
   * Only admins can update
   */
  async updateClub(clubId, userId, updates) {
    try {
      const club = await clubRepository.findById(clubId);

      if (!club) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Club not found",
          404
        );
      }

      // Verify user is admin
      const isAdmin = club.admins.some((id) => id.toString() === userId);
      if (!isAdmin) {
        throw new AppError(
          ERROR_CODES.INSUFFICIENT_ROLE,
          "You do not have permission to update this club",
          403
        );
      }

      // Allow only certain fields to be updated
      const allowedFields = [
        "name",
        "description",
        "category",
        "logoUrl",
        "websiteUrl",
        "socialLinks",
      ];
      const updateData = {};

      for (const field of allowedFields) {
        if (field in updates) {
          updateData[field] = updates[field];
        }
      }

      const updated = await clubRepository.update(clubId, updateData);

      logger.info({ clubId, userId }, "Club updated");

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, clubId }, "Failed to update club");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to update club",
        500
      );
    }
  }

  /**
   * Join club as member
   */
  async joinClub(clubId, userId) {
    try {
      const club = await clubRepository.findById(clubId);

      if (!club) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Club not found",
          404
        );
      }

      // Check if already member
      const isMember = club.members.some((id) => id.toString() === userId);
      if (isMember) {
        throw new AppError(
          ERROR_CODES.CONFLICT,
          "You are already a member of this club",
          409
        );
      }

      const updated = await clubRepository.addMember(clubId, userId);

      logger.info({ clubId, userId }, "User joined club");

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, clubId, userId }, "Failed to join club");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to join club",
        500
      );
    }
  }

  /**
   * Leave club
   */
  async leaveClub(clubId, userId) {
    try {
      const club = await clubRepository.findById(clubId);

      if (!club) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Club not found",
          404
        );
      }

      // Prevent admin from leaving without transferring ownership
      const isAdmin = club.admins.some((id) => id.toString() === userId);
      const adminCount = club.admins.length;

      if (isAdmin && adminCount === 1) {
        throw new AppError(
          ERROR_CODES.CONFLICT,
          "Cannot leave club as sole admin. Transfer ownership first.",
          409
        );
      }

      const updated = await clubRepository.removeMember(clubId, userId);

      logger.info({ clubId, userId }, "User left club");

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, clubId, userId }, "Failed to leave club");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to leave club",
        500
      );
    }
  }

  /**
   * Add admin to club
   */
  async addAdmin(clubId, userId, newAdminId) {
    try {
      const club = await clubRepository.findById(clubId);

      if (!club) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Club not found",
          404
        );
      }

      // Verify requester is admin
      const isAdmin = club.admins.some((id) => id.toString() === userId);
      if (!isAdmin) {
        throw new AppError(
          ERROR_CODES.INSUFFICIENT_ROLE,
          "You do not have permission to add admins",
          403
        );
      }

      const updated = await clubRepository.addAdmin(clubId, newAdminId);

      logger.info({ clubId, userId, newAdminId }, "Admin added to club");

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to add admin",
        500
      );
    }
  }

  /**
   * Remove admin from club
   */
  async removeAdmin(clubId, userId, adminToRemoveId) {
    try {
      const club = await clubRepository.findById(clubId);

      if (!club) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Club not found",
          404
        );
      }

      // Verify requester is admin
      const isAdmin = club.admins.some((id) => id.toString() === userId);
      if (!isAdmin) {
        throw new AppError(
          ERROR_CODES.INSUFFICIENT_ROLE,
          "You do not have permission to remove admins",
          403
        );
      }

      // Prevent removing last admin
      if (club.admins.length === 1) {
        throw new AppError(
          ERROR_CODES.CONFLICT,
          "Cannot remove the only admin from club",
          409
        );
      }

      const updated = await clubRepository.removeAdmin(clubId, adminToRemoveId);

      logger.info(
        { clubId, userId, adminToRemoveId },
        "Admin removed from club"
      );

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to remove admin",
        500
      );
    }
  }

  /**
   * Get club members
   */
  async getClubMembers(clubId, limit = 50, skip = 0) {
    try {
      const club = await clubRepository.findById(clubId);

      if (!club) {
        throw new AppError(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          "Club not found",
          404
        );
      }

      return {
        total: club.members.length,
        members: club.members.slice(skip, skip + limit),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to fetch club members",
        500
      );
    }
  }

  /**
   * Search clubs
   */
  async searchClubs(query, collegeId, limit = 20) {
    if (!query || query.trim().length < 2) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "Search query must be at least 2 characters",
        400
      );
    }

    try {
      const clubs = await clubRepository.search(query, collegeId, limit);
      return clubs;
    } catch (error) {
      logger.error({ error, query }, "Club search failed");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to search clubs",
        500
      );
    }
  }

  /**
   * Get clubs by college
   */
  async getCollegeClubs(collegeId, limit = 50, skip = 0) {
    try {
      const clubs = await clubRepository.findByCollege(collegeId, limit, skip);
      const total = await clubRepository.count(collegeId);

      return {
        total,
        clubs,
      };
    } catch (error) {
      logger.error({ error, collegeId }, "Failed to fetch college clubs");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to fetch clubs",
        500
      );
    }
  }

  /**
   * List clubs with pagination and filtering
   */
  async listClubs(filters, limit = 10, skip = 0) {
    try {
      const query = {};

      // Filter by college if provided
      if (filters.collegeId) {
        query.collegeId = filters.collegeId;
      }

      // Filter by category if provided
      if (filters.category) {
        query.category = filters.category;
      }

      // Fetch clubs and count total using repository
      const clubs = await clubRepository.findByFilters(query, limit, skip);
      const total = await clubRepository.countByFilters(query);

      return {
        clubs,
        total,
      };
    } catch (error) {
      logger.error({ error, filters }, "Failed to list clubs");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to fetch clubs",
        500
      );
    }
  }
}

export default new ClubService();
