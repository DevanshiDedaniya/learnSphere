import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { createCourse } from "../../features/course/courseSlice";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import "../../styles/CreateCourse.css";

export default function CreateCourse() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    courseDuration: "",
    category: "",
    level: "beginner",
    skills_gain: "",
    tags: "",
    thumbnail: null,
    modules: [
      {
        title: "",
        description: "",
        lessons: [{ title: "", description: "", duration: "", video: null }],
      },
    ],
  });

  const [isUploading, setIsUploading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalDurationMinutes = useMemo(() => {
    return formData.modules.reduce((modAcc, mod) => {
      const lessonsSum = (mod.lessons || []).reduce((lessonAcc, lesson) => {
        const duration = Number(lesson.duration) || 0;
        return lessonAcc + duration;
      }, 0);
      return modAcc + lessonsSum;
    }, 0);
  }, [formData.modules]);

  const formattedTotalDuration = useMemo(() => {
    const mins = totalDurationMinutes;
    if (!mins) return "0 mins";

    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;

    return hours > 0
      ? `${hours} hr${hours > 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}`
      : `${minutes} mins`;
  }, [totalDurationMinutes]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleModuleChange = (modIndex, e) => {
    const { name, value } = e.target;
    const updatedModules = [...formData.modules];
    updatedModules[modIndex][name] = value;
    setFormData({ ...formData, modules: updatedModules });
  };

  const handleLessonChange = (modIndex, lessonIndex, e) => {
    const { name, value, files } = e.target;
    const updatedModules = [...formData.modules];

    if (files) {
      updatedModules[modIndex].lessons[lessonIndex][name] = files[0];
    } else {
      updatedModules[modIndex].lessons[lessonIndex][name] = value;
    }

    setFormData({ ...formData, modules: updatedModules });
  };

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [
        ...formData.modules,
        {
          title: "",
          description: "",
          lessons: [{ title: "", description: "", duration: "", video: null }],
        },
      ],
    });
  };

  const removeModule = (index) => {
    const updatedModules = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: updatedModules });
  };

  const addLesson = (modIndex) => {
    const updatedModules = [...formData.modules];
    updatedModules[modIndex].lessons.push({
      title: "",
      description: "",
      duration: "",
      video: null,
    });
    setFormData({ ...formData, modules: updatedModules });
  };

  const removeLesson = (modIndex, lessonIndex) => {
    const updatedModules = [...formData.modules];
    updatedModules[modIndex].lessons = updatedModules[modIndex].lessons.filter(
      (_, i) => i !== lessonIndex
    );
    setFormData({ ...formData, modules: updatedModules });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return;

    try {
      setIsUploading(true);

      let thumbnailUrl = "";
      if (formData.thumbnail instanceof File) {
        const thumbRes = await uploadToCloudinary(
          formData.thumbnail,
          "learnSphere_thumbnails"
        );
        thumbnailUrl = thumbRes.secure_url;
      }

      const modulesForBackend = await Promise.all(
        formData.modules.map(async (mod) => {
          const updatedLessons = await Promise.all(
            mod.lessons.map(async (lesson) => {
              let videoUrl = "";
              if (lesson.video instanceof File) {
                const videoRes = await uploadToCloudinary(
                  lesson.video,
                  "learnSphere_videos"
                );
                videoUrl = videoRes.secure_url;
              }
              return {
                title: lesson.title,
                description: lesson.description,
                duration: Number(lesson.duration) || 0,
                videoUrl: videoUrl,
              };
            })
          );

          return {
            title: mod.title,
            description: mod.description,
            lessons: updatedLessons,
          };
        })
      );

      const computedCourseDuration = totalDurationMinutes;

      const skillsArr = formData.skills_gain
        ? formData.skills_gain.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const tagsArr = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        courseDuration: String(computedCourseDuration),
        category: formData.category,
        level: formData.level,
        skills_gain: skillsArr,
        tags: tagsArr,
        thumbnail: thumbnailUrl,
        modules: modulesForBackend,
      };

      const res = await dispatch(createCourse(payload));
      if (res.meta.requestStatus === "fulfilled") {
        navigate("/instructor/dashboard");
      } else {
        console.error("Create course failed:", res);
        alert("Error creating course — check console for details.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message || "Error uploading media. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="create-course-container">
      <div className="create-course-box">
        <div className="create-course-header">
          <h2 className="create-course-title">Create New Course</h2>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <input
            name="title"
            placeholder="Course Title"
            value={formData.title}
            onChange={handleChange}
            className="input-field"
            required
          />

          <textarea
            name="description"
            placeholder="Course Description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="courseDuration"
              placeholder="Total Duration (auto)"
              value={formattedTotalDuration}
              readOnly
              className="input-field bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
            />

            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="input-field"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="skills_gain"
              placeholder="Skills (comma-separated)"
              value={formData.skills_gain}
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="tags"
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Thumbnail (course image)
            </label>
            <input
              type="file"
              name="thumbnail"
              accept="image/*"
              onChange={handleChange}
              className="file-input"
            />
          </div>

          <h3 className="section-title">Modules & Lessons</h3>

          {formData.modules.map((mod, modIndex) => (
            <div key={modIndex} className="module-card">
              <div className="module-header">
                <h4 className="module-title">Module {modIndex + 1}</h4>

                {formData.modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeModule(modIndex)}
                    className="remove-btn"
                  >
                    Remove Module
                  </button>
                )}
              </div>

              <input
                name="title"
                placeholder="Module Title"
                value={mod.title}
                onChange={(e) => handleModuleChange(modIndex, e)}
                className="input-field"
                required
              />

              <textarea
                name="description"
                placeholder="Module Description"
                value={mod.description}
                onChange={(e) => handleModuleChange(modIndex, e)}
                className="input-field"
              />

              <div className="space-y-4">
                {mod.lessons.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="lesson-card">
                    <input
                      placeholder="Lesson Title"
                      value={lesson.title}
                      onChange={(e) =>
                        handleLessonChange(modIndex, lessonIndex, e)
                      }
                      name="title"
                      className="input-field"
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        placeholder="Duration (minutes)"
                        value={lesson.duration}
                        onChange={(e) =>
                          handleLessonChange(modIndex, lessonIndex, e)
                        }
                        name="duration"
                        className="input-field"
                      />

                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          handleLessonChange(modIndex, lessonIndex, e)
                        }
                        name="video"
                        className="file-input"
                      />
                    </div>

                    <textarea
                      placeholder="Lesson Description"
                      value={lesson.description}
                      onChange={(e) =>
                        handleLessonChange(modIndex, lessonIndex, e)
                      }
                      name="description"
                      className="input-field"
                    />

                    {mod.lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLesson(modIndex, lessonIndex)}
                        className="remove-btn"
                      >
                        Remove Lesson
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addLesson(modIndex)}
                className="add-btn"
              >
                + Add Lesson
              </button>
            </div>
          ))}

          <div className="form-footer">
            <button
              type="button"
              onClick={addModule}
              className="secondary-btn"
            >
              + Add Module
            </button>

            <span className="duration-text">
              Total duration: <strong>{formattedTotalDuration}</strong>
            </span>
          </div>

          <div className="text-right mt-6">
            <button type="submit" className="primary-btn" disabled={isUploading}>
              {isUploading ? "Uploading & Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}