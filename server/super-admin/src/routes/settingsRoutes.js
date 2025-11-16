import { Router } from "express";
import {
  listSettings,
  upsertSetting,
} from "../controllers/settingsController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", listSettings);
router.post("/", upsertSetting);

export default router;
