import Course from "../models/Course.model.js";
import Enrollment from "../models/Enrollment.model.js";
import User from "../models/User.model.js";


export const createCourseService = async (courseData, instructorId) => {
  const {title,description,price,category,level,courseDuration,skills_gain,tags,modules,thumbnail} = courseData;

  const parsedSkills =
    typeof skills_gain === "string"
      ? JSON.parse(skills_gain)
      : skills_gain || [];
  const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags || [];
  const parsedModules =
    typeof modules === "string" ? JSON.parse(modules) : modules || [];

  for (const mod of parsedModules) {
    for (const lesson of mod.lessons || []) {
      if (!lesson.videoUrl) {
        throw new Error("Each lesson must have a video URL", 400);
      }
    }
  }

  const newCourse = await Course.create({
    title,
    description,
    instructor: instructorId,
    price: Number(price || 0),
    category,
    level,
    courseDuration: Number(courseDuration || 90),
    skills_gain: parsedSkills,
    tags: parsedTags,
    modules: parsedModules,
    thumbnail,
  });

  await User.findByIdAndUpdate(instructorId, {
    $inc: { "instructorProfile.totalCourses": 1 },
  });

  return newCourse;
};




export const getAllCoursesService = async (queryParams) => {
  const { q, category, tag, page = 1, limit = 12 } = queryParams;
  const filter = {};

  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [{ title: regex }, { tags: regex }];
  }

  if (category) filter.category = category;

  if (tag) {
    const tagsArray = tag.split(",");
    filter.tags = { $in: tagsArray.map((t) => new RegExp(t, "i")) };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Course.countDocuments(filter);

  const courses = await Course.find(filter)
    .populate("instructor", "fullName profileImage")
    .skip(skip)
    .limit(Number(limit));

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    courses,
  };
};



export const getInstructorCoursesService = async (instructorId,queryParams) => {
  const { page = 1, limit = 12 } = queryParams;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Course.countDocuments({ instructor: instructorId });

  const courses = await Course.find({ instructor: instructorId })
    .populate("instructor", "fullName profileImage")
    .skip(skip)
    .limit(Number(limit));

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    courses,
  };
};



export const getCourseByIdService = async (courseId) => {
  const course = await Course.findById(courseId).populate(
    "instructor",
    "fullName bio email profileImage",
  );

  if (!course) {
    throw new Error("Course not found", 404);
  }

  const avgRating =
    course.ratedBy && course.ratedBy.length > 0
      ? course.ratedBy.reduce((sum, r) => sum + r.rating, 0) /
        course.ratedBy.length
      : 0;

  const courseData = {
    ...course.toObject(),
    averageRating: avgRating,
  };

  return courseData;
};



export const addModuleService = async (courseId, moduleData) => {
  const { title, description } = moduleData;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found", 404);
  }

  const newModule = { title, description: description || "", lessons: [] };
  course.modules.push(newModule);

  await course.save();
  return course;
};



export const addLessonService = async (courseId, moduleId, lessonData) => {
  const { title, duration, description, videoUrl } = lessonData;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found", 404);
  }

  const module = course.modules.id(moduleId) || course.modules[parseInt(moduleId, 10)];
  if (!module) {
    throw new Error("Module not found", 404);
  }

  const newLesson = {
    title,
    videoUrl,
    duration: duration || 0,
    description: description || "",
  };

  module.lessons.push(newLesson);
  await course.save();
  return course;
};



export const updateCourseService = async (courseId, updateData) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found", 404);
  }

  const {title,description,price,category,level,courseDuration,thumbnail,skills_gain,tags,modules} = updateData;

  if (title) course.title = title;
  if (description) course.description = description;
  if (price !== undefined) course.price = Number(price);
  if (category) course.category = category;
  if (level) course.level = level;
  if (courseDuration !== undefined)
    course.courseDuration = Number(courseDuration);
  if (thumbnail) course.thumbnail = thumbnail;

  course.skills_gain =
    typeof skills_gain === "string"
      ? JSON.parse(skills_gain)
      : skills_gain || course.skills_gain;
  course.tags =
    typeof tags === "string" ? JSON.parse(tags) : tags || course.tags;
  course.modules =
    typeof modules === "string"
      ? JSON.parse(modules)
      : modules || course.modules;

  await course.save();

  return course;
};



export const deleteCourseService = async (courseId, instructorId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found", 404);
  }

  await course.deleteOne();
  await User.findByIdAndUpdate(instructorId, {
    $inc: { "instructorProfile.totalCourses": -1 },
  });
  return null;
};



export const rateCourseService = async (courseId, userId, rating) => {
  const enrolled = await Enrollment.findOne({
    student: userId,
    course: courseId,
  });

  if (!enrolled) {
    throw new Error("You must enroll before rating", 403);
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found", 404);
  }

  const existing = course.ratedBy.find(
    (r) => String(r.user) === String(userId),
  );

  if (existing) {
    existing.rating = rating;
  } else {
    course.ratedBy.push({ user: userId, rating });
  }

  const total = course.ratedBy.reduce((sum, r) => sum + r.rating, 0);
  course.rating = total / course.ratedBy.length;

  await course.save();
  return {
    courseRating: course.rating.toFixed(1),
    isUpdated: !!existing,
  };
};
