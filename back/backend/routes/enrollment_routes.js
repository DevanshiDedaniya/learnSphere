import express from "express";
import {
    createEnrollment,
    enrollCourse,
    updateProgress,
    getMyEnrollments,
    getInstructorEnrollments
} from "../controllers/enrollmentController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", authMiddleware(["student"]), createEnrollment);
router.get("/my", authMiddleware(["student"]), getMyEnrollments);
router.post("/:courseId", authMiddleware(["student"]), enrollCourse);
router.put("/:enrollmentId/progress", authMiddleware(["student"]), updateProgress);

//  Instructor-only: fetch all enrollments
router.get("/instructor", authMiddleware(["instructor"]), getInstructorEnrollments);


export default router;
