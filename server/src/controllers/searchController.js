import searchService from "../services/searchService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchAll = asyncHandler(async (req, res) => {
  const { q, limit, types, collegeId } = req.query;

  const result = await searchService.searchAll(q, {
    limit: limit ? parseInt(limit, 10) : undefined,
    types: types ? types.split(",").map((t) => t.trim()) : undefined,
    collegeId,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});
