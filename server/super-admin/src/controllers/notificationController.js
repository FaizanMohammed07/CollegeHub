import PlatformAnnouncement from "../schemas/PlatformAnnouncement.js";
import { sendMail } from "../services/mailerService.js";
import User from "../../../src/schemas/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendNotification = asyncHandler(async (req, res) => {
  const payload = await PlatformAnnouncement.create({
    ...req.body,
    status: "sent",
    sentAt: new Date(),
    createdBy: req.superAdmin.email,
  });

  const { target = "all", colleges = [], roles = [] } = req.body;
  const query = {};
  if (target === "colleges" && colleges.length) {
    query.collegeId = { $in: colleges };
  }
  if (target === "roles" && roles.length) {
    query.role = { $in: roles };
  }

  const recipients = await User.find(query).select("email").lean();

  await Promise.all(
    recipients.map((user) =>
      sendMail({
        to: user.email,
        subject: payload.title,
        text: req.body.message,
      })
    )
  );

  res.json({ success: true, data: payload, recipients: recipients.length });
});
