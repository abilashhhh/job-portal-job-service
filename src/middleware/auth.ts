import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sql } from "../utils/db.js";

interface User {
  user_id: number;
  email: string;
  name: string;
  phone_number: string;
  role: "recruiter" | "jobseeker";
  bio: string | null;
  profile_pic_public_id: string | null;
  profile_pic: string | null;
  resume: string | null;
  resume_public_id: string | null;
  skills: string[] | null;
  subscription: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const isAuth = async (
  // req: Request,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authorization header is missing" });
      return;
    }

    const token = authHeader!.split(" ")[1];
    const decodedPayload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    if (!decodedPayload || !decodedPayload.id) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    const users = await sql`
        SELECT u.user_id,
               u.email,
               u.name,
               u.phone_number,
               u.role,
               u.bio,
               u.profile_pic_public_id,
               u.profile_pic,
               u.resume,
               u.resume_public_id,
               u.subscription,
               ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
        FROM users u
        LEFT JOIN user_skills us ON u.user_id = us.user_id
        LEFT JOIN skills s ON us.skill_id = s.skill_id
        WHERE u.user_id = ${decodedPayload.id}
        GROUP BY u.user_id;
      `;

    if (users.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const user = users[0] as User;
    user.skills = user.skills || [];
    req.user = user;
    next();
  } catch (error) {
    console.log("Authentication error:", error);
    res
      .status(401)
      .json({ message: "Authentication failed, Please login again" });
  }
};
