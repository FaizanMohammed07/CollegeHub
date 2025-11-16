import User from "../schemas/User.js";

const COLLEGE_PROJECTION = "name logoUrl address domain";

/**
 * User Repository - handles all user database operations
 */
export class UserRepository {
  async findById(userId) {
    return User.findById(userId).populate("collegeId", COLLEGE_PROJECTION);
  }

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).populate(
      "collegeId",
      COLLEGE_PROJECTION
    );
  }

  async findByEmailWithPassword(email) {
    return User.findByEmailWithPassword(email).populate(
      "collegeId",
      COLLEGE_PROJECTION
    );
  }

  async create(userData) {
    const user = new User(userData);
    const saved = await user.save();
    return saved.populate("collegeId", COLLEGE_PROJECTION);
  }

  async update(userId, updates) {
    return User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).populate("collegeId", COLLEGE_PROJECTION);
  }

  async findByIdAndBlock(userId, reason) {
    return User.findByIdAndUpdate(
      userId,
      {
        blocked: true,
        blockReason: reason,
      },
      { new: true }
    ).populate("collegeId", COLLEGE_PROJECTION);
  }

  async findByIdAndUnblock(userId) {
    return User.findByIdAndUpdate(
      userId,
      {
        blocked: false,
        blockReason: null,
      },
      { new: true }
    ).populate("collegeId", COLLEGE_PROJECTION);
  }

  async updateRefreshToken(userId, token, version) {
    return User.findByIdAndUpdate(
      userId,
      {
        lastRefreshToken: token,
        refreshTokenVersion: version,
      },
      { new: true, select: "+lastRefreshToken +refreshTokenVersion" }
    );
  }

  async getRefreshTokenInfo(userId) {
    return User.findById(userId).select(
      "+lastRefreshToken +refreshTokenVersion"
    );
  }

  async updateLastSeen(userId) {
    return User.findByIdAndUpdate(
      userId,
      { lastSeenAt: new Date() },
      { new: true }
    ).populate("collegeId", COLLEGE_PROJECTION);
  }

  async updateLocation(userId, lat, lng) {
    return User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
      },
      { new: true }
    ).populate("collegeId", COLLEGE_PROJECTION);
  }

  async findNearby(lat, lng, maxDistance = 5000) {
    return User.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistance,
        },
      },
      blocked: false,
    }).populate("collegeId", COLLEGE_PROJECTION);
  }

  async findByRole(role, limit = 100, skip = 0) {
    return User.find({ role })
      .limit(limit)
      .skip(skip)
      .populate("collegeId", COLLEGE_PROJECTION);
  }

  async findByCollege(collegeId, limit = 100, skip = 0) {
    return User.find({ collegeId })
      .limit(limit)
      .skip(skip)
      .populate("collegeId", COLLEGE_PROJECTION);
  }

  async countByEmail(email) {
    return User.countDocuments({ email: email.toLowerCase() });
  }

  async search(query, limit = 20) {
    return User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      blocked: false,
    })
      .limit(limit)
      .populate("collegeId", COLLEGE_PROJECTION);
  }

  async verifyEmail(userId) {
    return User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    ).populate("collegeId", COLLEGE_PROJECTION);
  }

  async delete(userId) {
    return User.findByIdAndDelete(userId);
  }
}

export default new UserRepository();
