import { Router } from "express";
import {
  listPosts,
  flagPost,
  unflagPost,
  deletePost,
  listAnnouncements,
  createAnnouncement,
} from "../controllers/announcementController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/posts", listPosts);
router.post("/posts/:id/flag", flagPost);
router.post("/posts/:id/unflag", unflagPost);
router.delete("/posts/:id", deletePost);
router.get("/announcements", listAnnouncements);
router.post("/announcements", createAnnouncement);

export default router;
