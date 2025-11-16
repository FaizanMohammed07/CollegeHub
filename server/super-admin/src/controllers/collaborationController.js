import Collaboration from "../schemas/Collaboration.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listCollaborations = asyncHandler(async (req, res) => {
  const collaborations = await Collaboration.find()
    .populate("hostColleges", "name")
    .populate("participatingClubs", "name")
    .lean();
  res.json({ success: true, data: collaborations });
});

export const createCollaboration = asyncHandler(async (req, res) => {
  const collaboration = await Collaboration.create(req.body);
  res.status(201).json({ success: true, data: collaboration });
});

export const updateCollaborationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const collaboration = await Collaboration.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  res.json({ success: true, data: collaboration });
});
