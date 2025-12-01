import Enrollment from "../models/Enrollment.js";
import { createEnrollmentHelper } from "../utils/enrollmentHelper.js";
import Course from "../models/Course.js";


/**
 * Create enrollment directly (called internally or after payment)
 */
export const createEnrollment = async (req, res) => {
  try {
    const { courseId, paymentId } = req.body;
    const userId = req.user._id; // ✅ Fix: define userId from authMiddleware

    const existingEnrollment = await Enrollment.findOne({ student: userId, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    const enrollment = await createEnrollmentHelper(userId, courseId, paymentId);
    res.status(201).json(enrollment);
  } catch (err) {
    console.error("Error creating enrollment:", err);
    res.status(500).json({ message: "Failed to create enrollment" });
  }
};

/**
 * POST /api/enrollments/:courseId/enroll
 * Called by students when clicking "Enroll" after payment
 */
export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { paymentId } = req.body;
    const userId = req.user._id;

    const existing = await Enrollment.findOne({ student: userId, course: courseId });
    if (existing) return res.status(400).json({ message: "Already enrolled" });


    // Reuse helper directly ✅
    const enrollment = await createEnrollmentHelper(userId, courseId, paymentId);

    res.status(201).json({
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (err) {
    console.error("enrollCourse:", err);
    res.status(400).json({ message: err.message || "Unable to enroll" });
  }
};

/**
 * GET /api/enrollments/my
 */
export const getMyEnrollments = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate("course");
    res.json(enrollments);
  } catch (err) {
    console.error("Error fetching enrollments:", err);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};



/**
 * PUT /api/enrollments/:enrollmentId/progress
 */
export const updateProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { lessonId, watchedDuration = 0, isCompleted = false } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate({
        path: "course",
        select: "modules",
        populate: {
          path: "modules",
          populate: { path: "lessons", model: "Lesson", select: "_id" },
        },
      });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Ensure only the enrolled student can update
    if (String(enrollment.student) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check expiration
    if (enrollment.expiresAt && new Date() > new Date(enrollment.expiresAt)) {
      enrollment.status = "expired";
      await enrollment.save();
      return res.status(403).json({ message: "Access expired" });
    }

    // Update or add lesson progress
    const existing = enrollment.progress.find(
      (p) => String(p.lessonId) === String(lessonId)
    );

    if (existing) {
      existing.watchedDuration = Math.max(existing.watchedDuration, watchedDuration);
      if (isCompleted) existing.isCompleted = true;
    } else {
      enrollment.progress.push({ lessonId, watchedDuration, isCompleted });
    }

    // Calculate completion based on **total lessons in course**
    const totalLessons = enrollment.course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    );

    const completedLessons = enrollment.progress.filter((p) => p.isCompleted).length;

    enrollment.completionPercentage = totalLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    // Update status
    if (enrollment.completionPercentage === 100) {
      enrollment.status = "completed";
      enrollment.completedAt = new Date();
    } else if (enrollment.completionPercentage > 0) {
      enrollment.status = "in_progress";
      enrollment.completedAt = null;
    }

    await enrollment.save();

    return res.json({ enrollment });
  } catch (err) {
    console.error("updateProgress error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getInstructorEnrollments = async (req, res) => {
  try {
    // logged-in instructor id
    const instructorId = req.user._id;

    // Get courses created by this instructor
    const courses = await Course.find({ instructor: instructorId }).select("_id");

    const courseIds = courses.map(c => c._id);

    // Get enrollments only for these courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate("student", "fullName email")
      .populate("course", "title price");

    res.json(enrollments);

  } catch (err) {
    console.error("Error fetching instructor enrollments:", err);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};

