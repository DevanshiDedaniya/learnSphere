import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js"; // ✅ Missing import for rating validation
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import User from "../models/User.js";


// Upload image from buffer using stream
const uploadImageFromBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};


/** 🔹 Helper to upload video from memory */
const uploadVideoToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "video", folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const createCourse = async (req, res, next) => {
  try {
    //console.log("🟢 Files received by Multer:");
    //console.dir(req.files, { depth: null });
    const {
      title,
      description,
      price,
      category,
      level,
      courseDuration,
      skills_gain,
      tags,
      modules,
    } = req.body;

    if (!title || !description)
      return res.status(400).json({ message: "Title and description are required" });

    /** 🟢 1. Convert files array to map for easier lookup */
    const filesMap = {};
    (req.files || []).forEach(file => {
      filesMap[file.fieldname] = file;
    });

    /** 🟢 2. Upload thumbnail */
    let thumbnailUrl = "";
    if (filesMap["thumbnail"]) {
      const uploadThumb = await uploadImageFromBuffer(filesMap["thumbnail"].buffer, "course_thumbnails");
      thumbnailUrl = uploadThumb.secure_url;
    }

    /** 🟢 2. Parse JSON data */
    const parsedSkills = typeof skills_gain === "string" ? JSON.parse(skills_gain) : skills_gain || [];
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags || [];
    const parsedModules = typeof modules === "string" ? JSON.parse(modules) : modules || [];

    /** 🟢 3. Upload lesson videos */
    for (let i = 0; i < parsedModules.length; i++) {
      const mod = parsedModules[i];
      for (let j = 0; j < mod.lessons.length; j++) {
        const fieldName = `video_${i}_${j}`;
        const lessonFile = filesMap[fieldName];
        if (lessonFile) {
          const uploadRes = await uploadVideoToCloudinary(lessonFile.buffer, "course_videos");
          mod.lessons[j].videoUrl = uploadRes.secure_url;
        }
      }
    }

    /** 🟢 4. Save course */
    const newCourse = await Course.create({
      title,
      description,
      instructor: req.user._id,
      price: Number(price || 0),
      category,
      level,
      courseDuration: Number(courseDuration || 90),
      skills_gain: parsedSkills,
      tags: parsedTags,
      modules: parsedModules,
      thumbnail: thumbnailUrl,
    });

    // Update Instructor Stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "instructorProfile.totalCourses": 1 }
    });


    console.log("Files received:", req.files.map(f => f.fieldname));

    // await Course.findByIdAndDelete(courseId);
    // await User.findByIdAndUpdate(req.user._id, {
    //   $inc: { "instructorProfile.totalCourses": -1 }
    // });

    res.status(201).json({
      message: "✅ Course created successfully!",
      course: newCourse,
    });
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ---------------------- Get All Courses ---------------------- */
export const getAllCourses = async (req, res) => {
  try {
    const { q, category, tag, page = 1, limit = 12 } = req.query;

    const filter = {};

    // 🔹 Keyword search (in title or description)
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ];
    }

    // 🔹 Category filter
    if (category) filter.category = category;

    // 🔹 Tag-based search (single or multiple)
    if (tag) {
      const tagsArray = tag.split(","); // supports ?tag=react,frontend
      filter.tags = { $in: tagsArray.map(t => new RegExp(t, "i")) };
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find(filter)
      .populate("instructor", "fullName profileImage")
      .skip(Number(skip))
      .limit(Number(limit));

    res.json(courses);
  } catch (err) {
    console.error("getAllCourses:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ---------------------- Get Instructor’s Courses ---------------------- */
export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    res.json(courses);
  } catch (err) {
    console.error("Error fetching instructor courses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------- Get Course by ID ---------------------- */
// controllers/courseController.js

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate("instructor", "fullName bio email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const avg =
      course.ratedBy.length > 0
        ? course.ratedBy.reduce((sum, r) => sum + r.rating, 0) / course.ratedBy.length
        : 0;

    course.averageRating = avg;
    await course.save();

    // No need to populate modules/lessons — they’re embedded and already available
    res.json(course);
    //console.log("📦 Course fetched:", course);
  } catch (err) {
    console.error("getCourseById:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------- Add Module ---------------------- */
export const addModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    if (!title)
      return res.status(400).json({ message: "Module title is required" });

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ message: "Course not found" });

    if (String(course.instructor) !== String(req.user._id))
      return res
        .status(403)
        .json({ message: "Not authorized to modify this course" });

    const newModule = { title, description, lessons: [] };
    course.modules.push(newModule);
    await course.save();

    res.status(201).json({
      message: "Module added successfully",
      course,
    });
  } catch (err) {
    console.error("Error adding module:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------- Add Lesson ---------------------- */
export const addLesson = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { title, duration, description } = req.body;

    if (!title)
      return res.status(400).json({ message: "Lesson title is required" });

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ message: "Course not found" });

    if (String(course.instructor) !== String(req.user._id))
      return res
        .status(403)
        .json({ message: "Not authorized to modify this course" });

    let videoUrl = "";
    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "course_videos",
        "video"
      );
      videoUrl = uploadResult.secure_url;
    }

    const module =
      course.modules.id(moduleId) ||
      course.modules[parseInt(moduleId, 10)];

    if (!module)
      return res.status(404).json({ message: "Module not found" });

    const newLesson = { title, videoUrl, duration, description };
    module.lessons.push(newLesson);
    await course.save();

    res.status(201).json({
      message: "Lesson added successfully",
      course,
    });
  } catch (err) {
    console.error("Error adding lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------------- Update Course ---------------------- */
export const updateCourse = async (req, res) => {
  try {
    console.log("🟡 UPDATE COURSE TRIGGERED");
    console.log("Body keys:", Object.keys(req.body));
    console.log("Files received:", req.files ? Object.keys(req.files) : []);

    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    if (String(course.instructor) !== String(req.user._id))
      return res.status(403).json({ message: "Not authorized to edit this course" });

    // Parse JSON strings
    const parsedModules = req.body.modules
      ? JSON.parse(req.body.modules)
      : course.modules;
    const parsedSkills = req.body.skills_gain
      ? JSON.parse(req.body.skills_gain)
      : course.skills_gain;
    const parsedTags = req.body.tags
      ? JSON.parse(req.body.tags)
      : course.tags;

    // Upload new thumbnail if provided
    const filesMap = {};
    if (req.files) {
      req.files.forEach(file => {
        filesMap[file.fieldname] = file;
      });
    }

    // Thumbnail
    if (filesMap["thumbnail"]) {
      const uploadThumb = await uploadImageFromBuffer(filesMap["thumbnail"].buffer, "course_thumbnails");
      course.thumbnail = uploadThumb.secure_url;
    }

    // Lesson videos
    for (let i = 0; i < parsedModules.length; i++) {
      const module = parsedModules[i];
      for (let j = 0; j < module.lessons.length; j++) {
        const fieldName = `video_${i}_${j}`;
        const uploadedFile = filesMap[fieldName];
        if (uploadedFile) {
          const uploadRes = await uploadVideoToCloudinary(uploadedFile.buffer, "course_videos");
          module.lessons[j].videoUrl = uploadRes.secure_url;
        }
      }
    }


    // Apply updated fields
    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;
    course.price = req.body.price ? Number(req.body.price) : course.price;
    course.category = req.body.category || course.category;
    course.level = req.body.level || course.level;
    course.courseDuration = req.body.courseDuration
      ? Number(req.body.courseDuration)
      : course.courseDuration;
    course.skills_gain = parsedSkills;
    course.tags = parsedTags;
    course.modules = parsedModules;

    await course.save();

    res.json({
      message: "✅ Course updated successfully",
      course,
    });
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


/* ---------------------- Delete Course ---------------------- */
export const deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    if (String(course.instructor) !== String(req.user._id))
      return res
        .status(403)
        .json({ message: "Not authorized to delete this course" });

    // 🟢 Delete the course
    await course.deleteOne();

    // 🟢 Decrease instructor’s totalCourses count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "instructorProfile.totalCourses": -1 }
    });

    res.json({ message: "✅ Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    next(err);
  }
};


/* ---------------------- Rate Course ---------------------- */
export const rateCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });

    const enrolled = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (!enrolled)
      return res
        .status(403)
        .json({ message: "You must enroll before rating" });

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const existing = course.ratedBy.find(
      (r) => String(r.user) === String(req.user._id)
    );

    if (existing) existing.rating = rating;
    else course.ratedBy.push({ user: req.user._id, rating });

    // Recalculate average rating
    const total = course.ratedBy.reduce((sum, r) => sum + r.rating, 0);
    course.rating = total / course.ratedBy.length;

    await course.save();

    res.status(200).json({
      message: existing
        ? "Rating updated successfully"
        : "Rating added successfully",
      courseRating: course.rating.toFixed(1),
    });
  } catch (err) {
    console.error("Error adding rating:", err);
    next(err);
  }
};
