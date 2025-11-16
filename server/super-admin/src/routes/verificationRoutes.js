import { Router } from "express";
import {
  listRequests,
  getRequest,
  approveRequest,
  rejectRequest,
} from "../controllers/verificationController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", listRequests);
router.get("/:id", getRequest);
router.post("/:id/approve", approveRequest);
router.post("/:id/reject", rejectRequest);

export default router;
