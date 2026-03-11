import axios from "axios";
import { AuthenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { application } from "express";
import { applicationStatusUpdateTemplate } from "../template.js";
import { publishToTopic } from "../producer.js";

export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) throw new ErrorHandler(401, "Authentication error");
    if (user.role !== "recruiter")
      throw new ErrorHandler(
        403,
        "Forbidden - Only reqruiter can create a company",
      );

    const { name, description, website } = req.body;
    if (!name || !description || !website)
      throw new ErrorHandler(400, "All the fields are required");

    const existingCompanies =
      await sql`SELECT company_id FROM companies WHERE name=${name}`;
    if (existingCompanies.length > 0)
      throw new ErrorHandler(
        409,
        `A company with the same ${name} already exists`,
      );

    const file = req.file;
    if (!file) throw new ErrorHandler(400, "Company logo file is required");

    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content)
      throw new ErrorHandler(500, "Failed to create file buffer");

    const { data } = await axios.post<{ url: string; public_id: string }>(
      `${process.env.UPLOAD_SERVICE_URL}/api/utils/upload`,
      { buffer: fileBuffer.content },
    );

    const [newCompany] = await sql`
    INSERT INTO COMPANIES (name, description, website, logo, logo_public_id, recruiter_id) 
    VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${user?.user_id})
    RETURNING *`;

    res.json({
      message: "Company created successfully",
      company: newCompany,
    });
  },
);

export const deleteCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const { companyId } = req.params;
    if (!companyId) throw new ErrorHandler(400, "Compnay id is required");
    const [company] = await sql`SELECT logo_public_id FROM companies 
    WHERE company_id = ${companyId} AND recruiter_id = ${user?.user_id}`;

    if (!company)
      throw new ErrorHandler(
        404,
        "Company not found / You are not authorized to delete this",
      );

    await sql`DELETE FROM companies WHERE company_id = ${companyId}`;

    res.json({ message: "Company and associated jobs deleted successfully" });
  },
);

export const createJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication error");
  if (user.role !== "recruiter")
    throw new ErrorHandler(403, "Forbidden - Only reqruiter can create a job");

  const {
    title,
    description,
    salary,
    role,
    location,
    job_type,
    work_location,
    company_id,
    openings,
  } = req.body;
  if (
    !title ||
    !description ||
    !salary ||
    !role ||
    !location ||
    !job_type ||
    !work_location ||
    !company_id ||
    !openings
  ) {
    throw new ErrorHandler(400, "All fields are required");
  }

  const [company] =
    await sql`SELECT company_id FROM COMPANIES WHERE company_id = ${company_id}
                AND recruiter_id = ${user.user_id}`;

  if (!company) throw new ErrorHandler(404, "Company not found");

  const [newJob] =
    await sql`INSERT INTO jobs(title, description,location, salary, work_location, role, job_type, company_id, posted_by_recruiter_id, openings)
    VALUES (${title}, ${description}, ${location}, ${salary}, ${work_location}, ${role}, ${job_type}, ${company_id}, ${user.user_id}, ${openings})
    RETURNING *`;

  res.json({ message: "Job posted successfully", job: newJob });
});

export const updateJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) throw new ErrorHandler(401, "Authentication error");
  if (user.role !== "recruiter")
    throw new ErrorHandler(403, "Forbidden - Only recruiter can update a job");

  const { jobId } = req.params;

  const {
    title,
    description,
    salary,
    role,
    location,
    job_type,
    work_location,
    company_id,
    openings,
    is_active,
  } = req.body;

  if (
    !title ||
    !description ||
    !salary ||
    !role ||
    !location ||
    !job_type ||
    !work_location ||
    !company_id ||
    !openings
  ) {
    throw new ErrorHandler(400, "All fields are required");
  }

  const [existingJob] = await sql`
    SELECT posted_by_recruiter_id FROM jobs 
    WHERE job_id = ${jobId} 
  `;

  if (!existingJob) throw new ErrorHandler(404, "Job not found");

  if (existingJob.posted_by_recruiter_id !== user.user_id) {
    throw new ErrorHandler(
      403,
      "Forbidden, You are not authorized to update this job",
    );
  }

  const [updatedJob] = await sql`
    UPDATE jobs SET
      title = ${title},
      description = ${description},
      location = ${location},
      salary = ${salary},
      work_location = ${work_location},
      role = ${role},
      job_type = ${job_type},
      company_id = ${company_id},
      openings = ${openings},
      is_active = ${is_active}
    WHERE job_id = ${jobId}
    RETURNING *`;

  res.json({
    message: "Job updated successfully",
    job: updatedJob,
  });
});

export const getAllCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const companies =
      await sql`SELECT * FROM companies WHERE recruiter_id = ${req.user?.user_id}`;

    res.json(companies );
  },
);

export const getSingleCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { companyId } = req.params;
    if (!companyId) throw new ErrorHandler(400, "Compnay id is required");

    const [companyData] = await sql`
  SELECT c.*, COALESCE(
    (
      SELECT json_agg(j.*) 
      FROM jobs j 
      WHERE j.company_id = c.company_id
    ),
    '[]'::json
  ) AS jobs
  FROM companies c 
  WHERE c.company_id = ${companyId} 
  GROUP BY c.company_id;
`;

    if (!companyData) {
      throw new ErrorHandler(404, "Company not found");
    }

    res.json(companyData);
  },
);

export const getAllActiveJobs = TryCatch(async (req, res) => {
  const { title, location } = req.query as {
    title: string;
    location: string;
  };

  let querySting = `
        SELECT 
            j.job_id, 
            j.title, 
            j.description, 
            j.salary, 
            j.location, 
            j.job_type, 
            j.role, 
            j.work_location, 
            j.created_at, 
            c.name AS company_name, 
            c.logo AS company_logo, 
            c.company_id AS company_id 
        FROM jobs j
        JOIN companies c ON j.company_id = c.company_id
        WHERE j.is_active = true
        `;

  const values = [];
  let paramIndex = 1;

  if (title) {
    querySting += ` AND j.title ILIKE $${paramIndex}`;
    values.push(`%${title}%`);
    paramIndex++;
  }

  if (location) {
    querySting += ` AND j.location ILIKE $${paramIndex}`;
    values.push(`%${location}%`);
    paramIndex++;
  }

  querySting += " ORDER BY j.created_at DESC";

  const jobs = (await sql.query(querySting, values)) as any[];

  res.json(jobs);
});

export const getSingleJob = TryCatch(async (req, res) => {
  const [job] = await sql`SELECT * FROM jobs WHERE job_id= ${req.params.jobId}`;
  res.json(job);
});

export const getAllApplicationsForJobId = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) throw new ErrorHandler(401, "Authentication required");
    if (user.role !== "recruiter")
      throw new ErrorHandler(403, "Forbidden to do this request");
    const { job_id } = req.params;
    const [job] =
      await sql`SELECT posted_by_recruiter_id FROM jobs WHERE job_id = ${job_id}`;
    if (!job) throw new ErrorHandler(404, "Job not found");
    if (job.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(403, "Forbidden, You are not allowed");
    }

    const applications =
      await sql`SELECT * FROM applications WHERE job_id = ${job_id}
      ORDER BY subscribed DESC,applied_at ASC`;

    res.json(applications);
  },
);

export const updateApplication = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) throw new ErrorHandler(401, "Authentication required");
    if (user.role !== "recruiter")
      throw new ErrorHandler(403, "Forbidden to do this request");
    const { application_id } = req.params;
    const [applications] =
      await sql`SELECT * FROM applications WHERE application_id = ${application_id}`;
    if (!applications) throw new ErrorHandler(404, "Application not found");

    const [job] =
      await sql`SELECT posted_by_recruiter_id, title FROM jobs WHERE job_id = ${applications.job_id}`;

    if (!job) {
      throw new ErrorHandler(404, "No jobs with this id");
    }

    if (job.posted_by_recruiter_id !== user.user_id) {
      throw new ErrorHandler(403, "Forbidden, You are not allowed");
    }

    const [updateApplication] =
      await sql`UPDATE applications SET status = ${req.body.status} 
      WHERE application_id = ${application_id}
      RETURNING *`;

    const message = {
      to: applications.applicant_email,
      subject: "Application Update",
      html: applicationStatusUpdateTemplate(job.title),
    };

    publishToTopic("send-mail", message).catch((error) => {
      console.error("Failed to publish message to kafka", error);
    });

    res.json({
      message: "Application Updated",
      job,
      updateApplication,
    });
  },
);
