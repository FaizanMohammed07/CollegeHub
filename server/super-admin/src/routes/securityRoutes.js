import { Router } from "express";
import { listLogs } from "../controllers/securityController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/logs", listLogs);

export default router;
