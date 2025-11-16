import { Router } from "express";
import {
  listCollaborations,
  createCollaboration,
  updateCollaborationStatus,
} from "../controllers/collaborationController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", listCollaborations);
router.post("/", createCollaboration);
router.post("/:id/status", updateCollaborationStatus);

export default router;
