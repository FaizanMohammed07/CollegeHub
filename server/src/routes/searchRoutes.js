import express from "express";
import { searchAll } from "../controllers/searchController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", searchAll);

export default router;
