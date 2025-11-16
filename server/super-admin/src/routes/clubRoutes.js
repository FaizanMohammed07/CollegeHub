import { Router } from "express";
import {
  listClubs,
  getClub,
  setClubVerification,
  removeClub,
  suspendClubAdmin,
  assignClubAdmin,
  getClubInsights,
} from "../controllers/clubController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", listClubs);
router.get("/:id", getClub);
router.post("/:id/verify", setClubVerification);
router.post("/:id/remove", removeClub);
router.post("/:id/suspend-admin", suspendClubAdmin);
router.post("/:id/assign-admin", assignClubAdmin);
router.get("/:id/insights", getClubInsights);

export default router;
