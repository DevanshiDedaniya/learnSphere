import { success, error } from "../utils/response.util.js";
import * as enrollmentService from "../services/enrollment.service.js";



export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { paymentId } = req.body;
    const userId = req.user._id;

    const enrollment = await enrollmentService.enrollCourseService(
      userId,
      courseId,
      paymentId
    );

    return success(res, enrollment, "Enrolled successfully", 201);
  } catch (err) {
    console.error("enrollCourse error:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Unable to enroll", statusCode);
  }
};



export const getMyEnrollments = async (req, res) => {
  try {
    const result = await enrollmentService.getMyEnrollmentsService(
      req.user._id,
      req.query
    );
    return success(res, result, "Enrollments fetched successfully");
  } catch (err) {
    console.error("getMyEnrollments error:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Failed to fetch enrollments", statusCode);
  }
};



export const updateProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { lessonId, watchedDuration = 0, isCompleted = false } = req.body;

    const enrollment = await enrollmentService.updateProgressService(
      enrollmentId,
      lessonId,
      watchedDuration,
      isCompleted
    );

    return success(res, enrollment, "Progress updated successfully");
  } catch (err) {
    console.error("updateProgress error:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Server error", statusCode);
  }
};



export const getInstructorEnrollments = async (req, res) => {
  try {
    const result = await enrollmentService.getInstructorEnrollmentsService(
      req.user._id,
      req.query
    );
    return success(res, result, "Instructor enrollments fetched successfully");
  } catch (err) {
    console.error("getInstructorEnrollments:", err);
    const statusCode = err.statusCode || 500;
    return error(res, err.message || "Failed to fetch enrollments", statusCode);
  }
};

