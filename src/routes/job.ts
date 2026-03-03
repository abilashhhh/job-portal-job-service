import express from "express";
import { createCompany, createJob, deleteCompany, updateJob } from "../controllers/job.js";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.post("/createCompany", isAuth, uploadFile, createCompany);
router.delete("/deleteCompany/:companyId", isAuth, deleteCompany);
router.post("/createJob", isAuth, createJob);
router.put("/updateJob/:jobId", isAuth, updateJob);

export default router;
