import College from "../schemas/College.js";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * College Repository
 */
export class CollegeRepository {
  async findById(collegeId) {
    return College.findById(collegeId).populate("admins");
  }

  async findByDomain(domain) {
    return College.findOne({ domain: domain.toLowerCase() });
  }

  async findByName(name) {
    return College.findOne({ name });
  }

  async findByNameInsensitive(name) {
    if (!name) return null;
    const regex = new RegExp(`^${escapeRegExp(name.trim())}$`, "i");
    return College.findOne({ name: regex });
  }

  async findByNameOrPartial(name) {
    if (!name) return null;

    const exactMatch = await this.findByNameInsensitive(name);
    if (exactMatch) return exactMatch;

    const results = await this.search(name, 1);
    return results[0] || null;
  }

  async findOrCreateByName(name) {
    if (!name) return null;

    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const existing = await this.findByNameInsensitive(trimmedName);
    if (existing) return existing;

    try {
      const college = await this.create({ name: trimmedName });
      return college;
    } catch (error) {
      if (error.code === 11000) {
        return this.findByNameInsensitive(trimmedName);
      }
      throw error;
    }
  }

  async create(collegeData) {
    const college = new College(collegeData);
    return college.save();
  }

  async update(collegeId, updates) {
    return College.findByIdAndUpdate(collegeId, updates, {
      new: true,
      runValidators: true,
    });
  }

  async addAdmin(collegeId, userId) {
    return College.findByIdAndUpdate(
      collegeId,
      { $addToSet: { admins: userId } },
      { new: true }
    );
  }

  async removeAdmin(collegeId, userId) {
    return College.findByIdAndUpdate(
      collegeId,
      { $pull: { admins: userId } },
      { new: true }
    );
  }

  async isAdmin(collegeId, userId) {
    const college = await College.findById(collegeId);
    return college && college.admins.includes(userId);
  }

  async findAll(limit = 50, skip = 0) {
    return College.find().limit(limit).skip(skip);
  }

  async findNearby(lat, lng, maxDistance = 10000) {
    return College.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistance,
        },
      },
    });
  }

  async search(query, limit = 20) {
    return College.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { domain: { $regex: query, $options: "i" } },
        { address: { $regex: query, $options: "i" } },
      ],
    }).limit(limit);
  }

  async delete(collegeId) {
    return College.findByIdAndDelete(collegeId);
  }

  async count() {
    return College.countDocuments();
  }
}

export default new CollegeRepository();
