import express from "express";
import {enrollCourse,updateProgress,getMyEnrollments,getInstructorEnrollments} from "../controllers/enrollment.controller.js";
import auth from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { enrollCourseParamsSchema, enrollCourseBodySchema, updateProgressSchema } from "../validation/enrollment.validation.js";

const router = express.Router();

// router.post("/create", auth, authorize("student"), createEnrollment);
router.get("/my", auth, authorize("student"), getMyEnrollments);
router.post("/:courseId", auth, authorize("student"), validate(enrollCourseParamsSchema, "params"), validate(enrollCourseBodySchema), enrollCourse);
router.put("/:enrollmentId/progress", auth, authorize("student"), validate(updateProgressSchema), updateProgress);

router.get("/instructor", auth, authorize("instructor"), getInstructorEnrollments);

export default router;
