import express from "express";
import {
  createCompany,
  createJob,
  deleteCompany,
  getAllActiveJobs,
  getAllCompany,
  getSingleCompany,
  getSingleJob,
  updateJob,
} from "../controllers/job.js";
import { isAuth } from "../middleware/auth.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.post("/createCompany", isAuth, uploadFile, createCompany);
router.delete("/deleteCompany/:companyId", isAuth, deleteCompany);
router.post("/createJob", isAuth, createJob);
router.put("/updateJob/:jobId", isAuth, updateJob);
router.get("/getCompany/all", isAuth, getAllCompany);
router.get("/getCompany/:companyId", isAuth, getSingleCompany);
router.get("/getAllJobs/active", getAllActiveJobs);
router.get("/getSingleJob/:jobId", getSingleJob);

export default router;
