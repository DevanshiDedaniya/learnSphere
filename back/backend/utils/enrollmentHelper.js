// utils/enrollmentHelper.js
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";


export const createEnrollmentHelper = async (studentId, courseId, paymentId) => {
    try {
        // Check if already enrolled
        const existing = await Enrollment.findOne({ student: studentId, course: courseId });
        if (existing) return existing;

        // Find course
        const course = await Course.findById(courseId);
        if (!course) throw new Error("Course not found");

        // Calculate expiry date
        // Assuming course.courseDuration is in *days* — change to *minutes/hours* if needed
        const expiresAt = new Date(Date.now() + (course.courseDuration || 30) * 24 * 60 * 60 * 1000);

        // Create enrollment
        const enrollment = new Enrollment({
            student: studentId,
            course: courseId,
            payment: paymentId || null,
            startedAt: new Date(), // ✅ fixed: replaced undefined `now`
            completedAt: null,
            expiresAt,
            status: "enrolled"
        });

        await enrollment.save();

        // Update course stats
        course.totalStudents = (course.totalStudents || 0) + 1;
        await course.save();

        return enrollment;

    } catch (err) {
        console.error("❌ Error in createEnrollmentHelper:", err);
        throw err;
    }
};
