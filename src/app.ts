import cors from "cors"
import express from "express";
import jobRoutes from "./routes/job.js";
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/job", jobRoutes);

export default app;
