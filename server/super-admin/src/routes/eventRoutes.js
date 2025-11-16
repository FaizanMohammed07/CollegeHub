import { Router } from "express";
import {
  listEvents,
  getEvent,
  updateEventStatus,
  deleteEvent,
  resolveFlaggedEvent,
  getEventAnalytics,
} from "../controllers/eventController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", listEvents);
router.get("/:id", getEvent);
router.post("/:id/status", updateEventStatus);
router.delete("/:id", deleteEvent);
router.get("/:id/analytics", getEventAnalytics);
router.post("/reports/:reportId/resolve", resolveFlaggedEvent);

export default router;
