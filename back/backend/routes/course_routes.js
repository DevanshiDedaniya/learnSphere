import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  addModule,
  addLesson,
  updateCourse,
  deleteCourse,
  rateCourse,
  getInstructorCourses,
} from "../controllers/courseController.js";
import { authMiddleware } from "../middlewares/auth.js";
import multer from "multer";

//  Setup Multer
const storage = multer.memoryStorage(); // Files are stored temporarily in RAM // or diskStorage if you want to save files locally
const upload = multer({ storage });

const router = express.Router();

//  Instructor-only routes
//  Public (non-dynamic) routes FIRST
router.get("/", getAllCourses);

//  Instructor-only routes
router.post(
  "/create",
  authMiddleware(["instructor"]),
  upload.any(),  // accepts thumbnail + dynamic video fields
  createCourse
);

router.get("/instructor", authMiddleware(["instructor"]), getInstructorCourses);

router.post("/:courseId/module", authMiddleware(["instructor"]), addModule);

router.post(
  "/:courseId/module/:moduleId/lesson",
  authMiddleware(["instructor"]),
  upload.single("video"),
  addLesson
);

router.put("/update/:courseId", authMiddleware(["instructor"]), upload.any(), updateCourse);
router.delete("/:courseId", authMiddleware(["instructor"]), deleteCourse);

//  Student rating route BEFORE /:courseId
router.post("/rate/:courseId", authMiddleware(["student"]), rateCourse);

//  Dynamic route LAST (important)
router.get("/:courseId", getCourseById);


export default router;
