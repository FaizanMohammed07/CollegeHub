import { Router } from "express";
import {
  listUsers,
  getUser,
  banUser,
  unbanUser,
  changeRole,
  resetPassword,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/:id/ban", banUser);
router.post("/:id/unban", unbanUser);
router.post("/:id/role", changeRole);
router.post("/:id/reset-password", resetPassword);

export default router;
