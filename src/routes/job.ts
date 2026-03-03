import express from "express";
import { createCompany } from "../controllers/job.js";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.post("/company/create", isAuth, uploadFile, createCompany);

export default router;
