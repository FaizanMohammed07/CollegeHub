import Club from "../../../src/schemas/Club.js";
import User from "../../../src/schemas/User.js";
import ClubAdminRequest from "../schemas/ClubAdminRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendMail } from "../services/mailerService.js";

export const listRequests = asyncHandler(async (req, res) => {
  const { status = "pending", search, collegeId } = req.query;
  const query = { status };
  if (collegeId) query.collegeId = collegeId;
  if (search) {
    query.$or = [
      { clubName: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const requests = await ClubAdminRequest.find(query)
    .populate("userId", "name email")
    .populate("collegeId", "name")
    .populate("clubId", "name")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: requests });
});

export const getRequest = asyncHandler(async (req, res) => {
  const request = await ClubAdminRequest.findById(req.params.id)
    .populate("userId", "name email")
    .populate("collegeId", "name")
    .populate("clubId", "name")
    .lean();
  if (!request) {
    return res.status(404).json({ success: false, error: "Request not found" });
  }
  res.json({ success: true, data: request });
});

export const approveRequest = asyncHandler(async (req, res) => {
  const request = await ClubAdminRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, error: "Request not found" });
  }

  request.status = "approved";
  request.reviewedAt = new Date();
  request.reviewedBy = req.superAdmin.email;
  await request.save();

  const user = await User.findByIdAndUpdate(
    request.userId,
    { role: "club_admin" },
    { new: true }
  );

  if (request.clubId) {
    await Club.findByIdAndUpdate(request.clubId, { verified: true });
  }

  await sendMail({
    to: user.email,
    subject: "Club admin access approved",
    text: "Your club admin verification is approved. You now have access to the dashboard.",
  });

  res.json({ success: true, data: request });
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const { reason, cooldownDays = 7 } = req.body;
  const request = await ClubAdminRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, error: "Request not found" });
  }

  request.status = "rejected";
  request.reviewedAt = new Date();
  request.reviewedBy = req.superAdmin.email;
  request.rejectionReason = reason;
  request.nextEligibleAt = new Date(
    Date.now() + cooldownDays * 24 * 60 * 60 * 1000
  );
  await request.save();

  const user = await User.findById(request.userId);
  await sendMail({
    to: user.email,
    subject: "Club admin request update",
    text: `Your verification request was rejected. Reason: ${reason}`,
  });

  res.json({ success: true, data: request });
});
