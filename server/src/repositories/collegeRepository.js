import College from "../schemas/College.js";

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
