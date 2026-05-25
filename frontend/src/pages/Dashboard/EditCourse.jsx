import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCourseDetail, updateCourse } from "../../features/course/courseSlice";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload";
import "../../styles/EditCourse.css";

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { course, loading } = useSelector((state) => state.course);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    courseDuration: "",
    category: "",
    level: "",
    skills_gain: "",
    tags: "",
    thumbnail: "",
    modules: [],
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    dispatch(getCourseDetail(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        price: course.price || "",
        courseDuration: course.courseDuration || "",
        category: course.category || "",
        level: course.level || "beginner",
        skills_gain: course.skills_gain?.join(", ") || "",
        tags: course.tags?.join(", ") || "",
        thumbnail: course.thumbnail || "",
        modules:
          course.modules?.map((mod) => ({
            title: mod.title,
            description: mod.description,
            lessons:
              mod.lessons?.map((lesson) => ({
                title: lesson.title,
                description: lesson.description,
                duration: lesson.duration,
                videoUrl: lesson.videoUrl || "",
                video: null,
              })) || [],
          })) || [],
      });
    }
  }, [course]);

  const totalDurationMinutes = useMemo(() => {
    return formData.modules.reduce((acc, mod) => {
      const sum =
        mod.lessons?.reduce((lessonAcc, lesson) => {
          return lessonAcc + (Number(lesson.duration) || 0);
        }, 0) || 0;
      return acc + sum;
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
    const updated = [...formData.modules];
    updated[modIndex][name] = value;
    setFormData({ ...formData, modules: updated });
  };

  const handleLessonChange = (modIndex, lessonIndex, e) => {
    const { name, value, files } = e.target;
    const updated = [...formData.modules];

    if (files) {
      updated[modIndex].lessons[lessonIndex][name] = files[0];
    } else {
      updated[modIndex].lessons[lessonIndex][name] = value;
    }

    setFormData({ ...formData, modules: updated });
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
    const updated = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: updated });
  };

  const addLesson = (modIndex) => {
    const updated = [...formData.modules];
    updated[modIndex].lessons.push({
      title: "",
      description: "",
      duration: "",
      video: null,
    });
    setFormData({ ...formData, modules: updated });
  };

  const removeLesson = (modIndex, lessonIndex) => {
    const updated = [...formData.modules];
    updated[modIndex].lessons = updated[modIndex].lessons.filter(
      (_, i) => i !== lessonIndex
    );
    setFormData({ ...formData, modules: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return;

    try {
      setIsUploading(true);

      let thumbnailUrl = formData.thumbnail;
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
              let videoUrl = lesson.videoUrl;
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

      await dispatch(updateCourse({ id, data: payload }));
      navigate("/instructor/dashboard");
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message || "Error uploading media. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <p className="loading-text">Loading course...</p>;
  }

  return (
    <div className="edit-course-container">
      <div className="edit-course-box">
        <div className="page-header">
          <p className="page-subtitle">Instructor Panel</p>
          <h2 className="page-title">Edit Course</h2>
        </div>

        <form onSubmit={handleSubmit} className="edit-course-form">
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
              placeholder="Price (₹)"
              value={formData.price}
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <input
              name="courseDuration"
              value={formattedTotalDuration}
              readOnly
              className="input-field input-disabled"
            />
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
            <label className="field-label">Thumbnail</label>
            <input
              type="file"
              name="thumbnail"
              accept="image/*"
              onChange={handleChange}
              className="input-field"
            />

            {formData.thumbnail && !(formData.thumbnail instanceof File) && (
              <img
                src={formData.thumbnail}
                alt="Course Thumbnail"
                className="thumbnail-preview"
              />
            )}
          </div>

          <h3 className="section-title">Modules & Lessons</h3>

          {formData.modules.map((mod, modIdx) => (
            <div key={modIdx} className="module-card">
              <div className="module-header">
                <h4 className="module-title">Module {modIdx + 1}</h4>

                {formData.modules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeModule(modIdx)}
                    className="remove-btn"
                  >
                    Remove Module
                  </button>
                )}
              </div>

              <input
                name="title"
                value={mod.title}
                onChange={(e) => handleModuleChange(modIdx, e)}
                placeholder="Module Title"
                className="input-field"
              />

              <textarea
                name="description"
                value={mod.description}
                onChange={(e) => handleModuleChange(modIdx, e)}
                placeholder="Module Description"
                className="input-field"
              />

              {mod.lessons.map((lesson, lessonIdx) => (
                <div key={lessonIdx} className="lesson-card">
                  <input
                    name="title"
                    value={lesson.title}
                    onChange={(e) => handleLessonChange(modIdx, lessonIdx, e)}
                    placeholder="Lesson Title"
                    className="input-field"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="duration"
                      value={lesson.duration}
                      onChange={(e) =>
                        handleLessonChange(modIdx, lessonIdx, e)
                      }
                      placeholder="Duration (mins)"
                      className="input-field"
                    />

                    <input
                      type="file"
                      name="video"
                      accept="video/*"
                      onChange={(e) =>
                        handleLessonChange(modIdx, lessonIdx, e)
                      }
                      className="input-field"
                    />
                  </div>

                  {lesson.videoUrl && (
                    <video
                      src={lesson.videoUrl}
                      controls
                      className="lesson-video"
                    />
                  )}

                  <textarea
                    name="description"
                    value={lesson.description}
                    onChange={(e) => handleLessonChange(modIdx, lessonIdx, e)}
                    placeholder="Lesson Description"
                    className="input-field"
                  />

                  {mod.lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLesson(modIdx, lessonIdx)}
                      className="remove-btn"
                    >
                      Remove Lesson
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => addLesson(modIdx)}
                className="add-btn"
              >
                + Add Lesson
              </button>
            </div>
          ))}

          <div className="form-footer">
            <button type="button" onClick={addModule} className="add-btn">
              + Add Module
            </button>

            <span className="duration-text">
              Total: <strong>{formattedTotalDuration}</strong>
            </span>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={isUploading}>
              {isUploading ? "Uploading & Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}