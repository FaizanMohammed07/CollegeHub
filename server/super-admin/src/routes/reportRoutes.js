import { Router } from "express";
import {
  listReports,
  resolveReport,
  rejectReport,
} from "../controllers/reportController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", listReports);
router.post("/:id/resolve", resolveReport);
router.post("/:id/reject", rejectReport);

export default router;
