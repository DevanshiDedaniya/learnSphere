import express from "express";
import {createCourse,getAllCourses,getCourseById,addModule,addLesson,updateCourse,deleteCourse,rateCourse,getInstructorCourses,} from "../controllers/course.controller.js";
import auth from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createCourseSchema, updateCourseSchema } from "../validation/course.validation.js";

const router = express.Router();


router.get("/", getAllCourses);
router.get("/instructor", auth, authorize("instructor"), getInstructorCourses);
router.get("/:courseId",auth, authorize("student","instructor"), getCourseById);

router.post("/create", auth, authorize("instructor"), validate(createCourseSchema), createCourse);
router.post("/:courseId/module", auth, authorize("instructor"), addModule);
router.post("/:courseId/module/:moduleId/lesson", auth, authorize("instructor"), addLesson);
router.post("/rate/:courseId", auth, authorize("student"), rateCourse);

router.put("/update/:courseId", auth, authorize("instructor"), validate(updateCourseSchema), updateCourse);

router.delete("/:courseId", auth, authorize("instructor"), deleteCourse);


export default router;
