import { Router } from "express";
import { getPlatformAnalytics } from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/platform", getPlatformAnalytics);

export default router;
