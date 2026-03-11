import express from "express";
import {
  createCompany,
  createJob,
  deleteCompany,
  deleteJob,
  getAllActiveJobs,
  getAllApplicationsForJobId,
  getAllCompany,
  getSingleCompany,
  getSingleJob,
  updateApplication,
  updateJob,
} from "../controllers/job.js";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.post("/createCompany", isAuth, uploadFile, createCompany);
router.delete("/deleteCompany/:companyId", isAuth, deleteCompany);
router.post("/createJob", isAuth, createJob);
router.delete("/deleteJob/:jobId", isAuth, deleteJob);
router.put("/updateJob/:jobId", isAuth, updateJob);
router.get("/getCompany/all", isAuth, getAllCompany);
router.get("/getCompany/:companyId", getSingleCompany);
router.get("/getAllJobs/active", getAllActiveJobs);
router.get("/getSingleJob/:jobId", getSingleJob);
router.get("/getAllApplications/:job_id", isAuth, getAllApplicationsForJobId);
router.put("/updateApplication/:application_id", isAuth, updateApplication);

export default router;
