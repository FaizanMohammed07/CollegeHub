import clubRepository from "../repositories/clubRepository.js";
import collegeRepository from "../repositories/collegeRepository.js";
import userRepository from "../repositories/userRepository.js";
import eventRepository from "../repositories/eventRepository.js";
import { AppError, ERROR_CODES } from "../utils/AppError.js";
import logger from "../utils/logger.js";

const DEFAULT_LIMIT = 5;

class SearchService {
  async searchAll(query, options = {}) {
    if (!query || query.trim().length < 2) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "Search query must be at least 2 characters",
        400
      );
    }

    const limit = Math.min(options.limit || DEFAULT_LIMIT, 20);
    const types = options.types || ["clubs", "colleges", "students", "events"];
    const collegeId = options.collegeId;

    try {
      const tasks = [];

      if (types.includes("clubs")) {
        tasks.push(
          clubRepository.search(query, collegeId, limit).then((results) => ({
            key: "clubs",
            data: results,
          }))
        );
      }

      if (types.includes("colleges")) {
        tasks.push(
          collegeRepository
            .search(query, limit)
            .then((results) => results.map((college) => college.toObject()))
            .then((results) => ({ key: "colleges", data: results }))
        );
      }

      if (types.includes("students")) {
        tasks.push(
          userRepository.search(query, limit).then((results) => ({
            key: "students",
            data: results.map((user) => user.toJSON()),
          }))
        );
      }

      if (types.includes("events")) {
        tasks.push(
          eventRepository.search(query, limit).then((results) => ({
            key: "events",
            data: results,
          }))
        );
      }

      const sections = await Promise.all(tasks);

      return sections.reduce(
        (acc, section) => ({
          ...acc,
          [section.key]: section.data,
        }),
        { query }
      );
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, query }, "Global search failed");
      throw new AppError(
        ERROR_CODES.DATABASE_ERROR,
        "Failed to execute search",
        500
      );
    }
  }
}

export default new SearchService();
