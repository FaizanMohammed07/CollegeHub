import { Router } from "express";
import { sendNotification } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.post("/send", sendNotification);

export default router;
