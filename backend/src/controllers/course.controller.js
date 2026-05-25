import { success, error } from "../utils/response.util.js";
import * as courseService from "../services/course.service.js";

export const createCourse = async (req, res, next) => {
  try {
    const newCourse = await courseService.createCourseService(
      req.body,
      req.user._id
    );
    return success(res, newCourse, "Course created successfully", 201);
  } catch (err) {
    console.error("Error creating course:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Server error", statusCode);
  }
};



export const getAllCourses = async (req, res) => {
  try {
    const result = await courseService.getAllCoursesService(req.query);
    return success(res, result, "Courses fetched successfully");
  } catch (err) {
    console.error("getAllCourses:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Server error", statusCode);
  }
};



export const getInstructorCourses = async (req, res) => {
  try {
    const result = await courseService.getInstructorCoursesService(
      req.user._id,
      req.query
    );
    return success(res, result, "Instructor courses fetched successfully");
  } catch (err) {
    console.error("getInstructorCourses error:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Server error", statusCode);
  }
};



export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseData = await courseService.getCourseByIdService(courseId);
    return success(res, courseData, "Course fetched successfully");
  } catch (err) {
    console.error("getCourseById error:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Server error", statusCode);
  }
};



export const addModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await courseService.addModuleService(courseId, req.body);
    return success(res, course, "Module added successfully", 201);
  } catch (err) {
    console.error("addModule error:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Server error", statusCode);
  }
};



export const addLesson = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const course = await courseService.addLessonService(
      courseId,
      moduleId,
      req.body
    );
    return success(res, course, "Lesson added successfully", 201);
  } catch (err) {
    console.error("addLesson error:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Server error", statusCode);
  }
};




export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await courseService.updateCourseService(
      courseId,
      req.body
    );
    return success(res, course, "Course updated successfully");
  } catch (err) {
    console.error("updateCourse error:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Server error", statusCode);
  }
};



export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    await courseService.deleteCourseService(courseId, req.user._id);
    return success(res, null, "Course deleted successfully");
  } catch (err) {
    console.error("deleteCourse error:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Server error", statusCode);
  }
};



export const rateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating } = req.body;
    const result = await courseService.rateCourseService(
      courseId,
      req.user._id,
      rating
    );
    return success(
      res,
      { courseRating: result.courseRating },
      result.isUpdated
        ? "Rating updated successfully"
        : "Rating added successfully"
    );
  } catch (err) {
    console.error("rateCourse error:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Server error", statusCode);
  }
};