import Club from "../schemas/Club.js";

const USER_PROJECTION = "name profilePicUrl role";
const COLLEGE_PROJECTION = "name logoUrl address domain";

/**
 * Club Repository
 */
export class ClubRepository {
  async findById(clubId) {
    return Club.findById(clubId)
      .populate({ path: "admins", select: USER_PROJECTION })
      .populate({ path: "members", select: USER_PROJECTION })
      .populate({ path: "collegeId", select: COLLEGE_PROJECTION });
  }

  async findBySlug(slug, collegeId) {
    return Club.findOne({ slug, collegeId, removed: false });
  }

  async create(clubData) {
    const club = new Club(clubData);
    const saved = await club.save();
    return saved
      .populate({ path: "admins", select: USER_PROJECTION })
      .populate({ path: "members", select: USER_PROJECTION })
      .populate({ path: "collegeId", select: COLLEGE_PROJECTION });
  }

  async update(clubId, updates) {
    return Club.findByIdAndUpdate(clubId, updates, {
      new: true,
      runValidators: true,
    });
  }

  async addMember(clubId, userId) {
    return Club.findByIdAndUpdate(
      clubId,
      {
        $addToSet: { members: userId },
        $inc: { membersCount: 1 },
      },
      { new: true }
    )
      .populate({ path: "admins", select: USER_PROJECTION })
      .populate({ path: "members", select: USER_PROJECTION })
      .populate({ path: "collegeId", select: COLLEGE_PROJECTION });
  }

  async removeMember(clubId, userId) {
    return Club.findByIdAndUpdate(
      clubId,
      {
        $pull: { members: userId },
        $inc: { membersCount: -1 },
      },
      { new: true }
    )
      .populate({ path: "admins", select: USER_PROJECTION })
      .populate({ path: "members", select: USER_PROJECTION })
      .populate({ path: "collegeId", select: COLLEGE_PROJECTION });
  }

  async addAdmin(clubId, userId) {
    return Club.findByIdAndUpdate(
      clubId,
      { $addToSet: { admins: userId } },
      { new: true }
    )
      .populate({ path: "admins", select: USER_PROJECTION })
      .populate({ path: "members", select: USER_PROJECTION })
      .populate({ path: "collegeId", select: COLLEGE_PROJECTION });
  }

  async removeAdmin(clubId, userId) {
    return Club.findByIdAndUpdate(
      clubId,
      { $pull: { admins: userId } },
      { new: true }
    )
      .populate({ path: "admins", select: USER_PROJECTION })
      .populate({ path: "members", select: USER_PROJECTION })
      .populate({ path: "collegeId", select: COLLEGE_PROJECTION });
  }

  async isMember(clubId, userId) {
    const club = await Club.findById(clubId);
    return club && club.members.includes(userId);
  }

  async isAdmin(clubId, userId) {
    const club = await Club.findById(clubId);
    return club && club.admins.includes(userId);
  }

  async findByCollege(collegeId, limit = 50, skip = 0) {
    return Club.find({ collegeId, removed: false })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate({ path: "collegeId", select: COLLEGE_PROJECTION });
  }

  async findVerified(collegeId, limit = 50, skip = 0) {
    return Club.find({ collegeId, verified: true, removed: false })
      .limit(limit)
      .skip(skip)
      .populate({ path: "collegeId", select: COLLEGE_PROJECTION });
  }

  async search(query, collegeId, limit = 20) {
    const baseFilters = { removed: false };
    if (collegeId) {
      baseFilters.collegeId = collegeId;
    }

    return Club.find({
      ...baseFilters,
      $text: { $search: query },
    })
      .limit(limit)
      .sort({ score: { $meta: "textScore" } })
      .populate({ path: "collegeId", select: COLLEGE_PROJECTION });
  }

  async softDelete(clubId) {
    return Club.findByIdAndUpdate(clubId, { removed: true }, { new: true });
  }

  async restore(clubId) {
    return Club.findByIdAndUpdate(clubId, { removed: false }, { new: true });
  }

  async verify(clubId) {
    return Club.findByIdAndUpdate(clubId, { verified: true }, { new: true });
  }

  async delete(clubId) {
    return Club.findByIdAndDelete(clubId);
  }

  async count(collegeId) {
    return Club.countDocuments({ collegeId, removed: false });
  }

  async findByFilters(query, limit = 10, skip = 0) {
    return Club.find({ ...query, removed: false })
      .limit(limit)
      .skip(skip)
      .select(
        "name slug description category logoUrl membersCount createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .populate({ path: "collegeId", select: COLLEGE_PROJECTION });
  }

  async countByFilters(query) {
    return Club.countDocuments({ ...query, removed: false });
  }
}

export default new ClubRepository();
