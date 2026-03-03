import express from "express";
import { createCompany, deleteCompany } from "../controllers/job.js";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.post("/company/create", isAuth, uploadFile, createCompany);
router.delete("/company/delete/:companyId", isAuth, deleteCompany);

export default router;
