import { Router } from "express";
import {
  listColleges,
  createCollege,
  getCollege,
  updateCollege,
  setCollegeStatus,
  getCollegeAdmins,
  addCollegeAdmin,
  listCollegeEvents,
  listCollegeClubs,
  deleteCollege,
} from "../controllers/collegeController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

router.get("/", listColleges);
router.post("/", createCollege);
router.get("/:id", getCollege);
router.put("/:id", updateCollege);
router.post("/:id/status", setCollegeStatus);
router.get("/:id/admins", getCollegeAdmins);
router.post("/:id/admins", addCollegeAdmin);
router.get("/:id/events", listCollegeEvents);
router.get("/:id/clubs", listCollegeClubs);
router.delete("/:id", deleteCollege);

export default router;
