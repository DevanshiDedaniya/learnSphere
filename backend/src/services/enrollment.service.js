import Enrollment from "../models/Enrollment.model.js";
import Course from "../models/Course.model.js";



export const enrollCourseService = async (userId, courseId, paymentId) => {
  const existing = await Enrollment.findOne({
    student: userId,
    course: courseId,
  });

  if (existing) {
    throw new Error("Already enrolled in this course", 400);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found", 404);
  }

  const durationDays = course.courseDuration || 30;
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  const enrollment = await Enrollment.create({
    student: userId,
    course: courseId,
    payment: paymentId || null,
    startedAt: new Date(),
    completedAt: null,
    expiresAt,
    status: "enrolled",
  });

  await Course.findByIdAndUpdate(courseId, {
    $inc: { totalStudents: 1 },
  });

  return enrollment;
};



export const getMyEnrollmentsService = async (userId, queryParams) => {
  const { page = 1, limit = 10 } = queryParams;
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Enrollment.countDocuments({ student: userId });

  const enrollments = await Enrollment.find({ student: userId })
    .populate({
      path: "course",
      select: "title description thumbnail price category level modules",
      populate: {
        path: "modules.lessons",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    enrollments,
  };
};


export const updateProgressService = async (enrollmentId,lessonId,watchedDuration = 0,isCompleted = false) => {
  const enrollment = await Enrollment.findById(enrollmentId).populate(
    "course",
    "modules",
  );

  if (!enrollment) {
    throw new Error("Enrollment not found", 404);
  }

  if (enrollment.expiresAt && new Date() > new Date(enrollment.expiresAt)) {
    enrollment.status = "expired";
    await enrollment.save();
    throw new Error("Access expired", 403);
  }

  const existing = enrollment.progress.find(
    (p) => String(p.lessonId) === String(lessonId),
  );

  if (existing) {
    existing.watchedDuration = Math.max(
      existing.watchedDuration,
      watchedDuration,
    );
    if (isCompleted) existing.isCompleted = true;
  } else {
    enrollment.progress.push({ lessonId, watchedDuration, isCompleted });
  }

  const totalLessons = enrollment.course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  const completedLessons = enrollment.progress.filter(
    (p) => p.isCompleted,
  ).length;

  enrollment.completionPercentage = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  if (enrollment.completionPercentage === 100) {
    enrollment.status = "completed";
    enrollment.completedAt = new Date();
  } else if (enrollment.completionPercentage > 0) {
    enrollment.status = "in_progress";
    enrollment.completedAt = null;
  }

  await enrollment.save();

  return enrollment;
};



export const getInstructorEnrollmentsService = async (instructorId,queryParams) => {
  const { page = 1, limit = 10 } = queryParams;
  const skip = (Number(page) - 1) * Number(limit);

  const courses = await Course.find({ instructor: instructorId }).select("_id");

  if (!courses.length) {
    return {
      enrollments: [],
      total: 0,
      page: Number(page),
      limit: Number(limit),
      totalPages: 0,
    };
  }

  const courseIds = courses.map((c) => c._id);
  const total = await Enrollment.countDocuments({
    course: { $in: courseIds },
  });

  const enrollments = await Enrollment.find({ course: { $in: courseIds } })
    .populate("student", "fullName email")
    .populate("course", "title price")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    enrollments,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  };
};
