import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCourseDetail, updateCourse } from "../../features/course/courseSlice";
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

  // Fetch existing course
  useEffect(() => {
    dispatch(getCourseDetail(id));
  }, [dispatch, id]);

  // Prefill form when course loads
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
            lessons: mod.lessons?.map((lesson) => ({
              title: lesson.title,
              description: lesson.description,
              duration: lesson.duration,
              videoUrl: lesson.videoUrl || "",
              video: null, // for new uploads
            })),
          })) || [],
      });
    }
  }, [course]);

  // Compute total course duration
  const totalDurationMinutes = useMemo(() => {
    return formData.modules.reduce((acc, mod) => {
      const sum = mod.lessons?.reduce((lAcc, l) => lAcc + (Number(l.duration) || 0), 0) || 0;
      return acc + sum;
    }, 0);
  }, [formData.modules]);

  const formattedTotalDuration = useMemo(() => {
    const mins = totalDurationMinutes;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
  }, [totalDurationMinutes]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, [name]: files[0] });
    else setFormData({ ...formData, [name]: value });
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

  // Add/remove module or lesson
  const addModule = () => {
    setFormData({
      ...formData,
      modules: [
        ...formData.modules,
        { title: "", description: "", lessons: [{ title: "", description: "", duration: "", video: null }] },
      ],
    });
  };

  const removeModule = (i) => {
    const updated = formData.modules.filter((_, idx) => idx !== i);
    setFormData({ ...formData, modules: updated });
  };

  const addLesson = (modIndex) => {
    const updated = [...formData.modules];
    updated[modIndex].lessons.push({ title: "", description: "", duration: "", video: null });
    setFormData({ ...formData, modules: updated });
  };

  const removeLesson = (modIndex, lessonIndex) => {
    const updated = [...formData.modules];
    updated[modIndex].lessons = updated[modIndex].lessons.filter((_, i) => i !== lessonIndex);
    setFormData({ ...formData, modules: updated });
  };

  // Submit updated data
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("level", formData.level);
    data.append("courseDuration", String(totalDurationMinutes));
    data.append("skills_gain", JSON.stringify(formData.skills_gain.split(",").map((s) => s.trim())));
    data.append("tags", JSON.stringify(formData.tags.split(",").map((t) => t.trim())));

    if (formData.thumbnail instanceof File) data.append("thumbnail", formData.thumbnail);

    // Add modules + lessons (videos)
    const modulesData = formData.modules.map((mod, modIdx) => ({
      title: mod.title,
      description: mod.description,
      lessons: mod.lessons.map((lesson, lessonIdx) => ({
        title: lesson.title,
        description: lesson.description,
        duration: Number(lesson.duration) || 0,
        videoField: `video_${modIdx}_${lessonIdx}`,
      })),
    }));

    data.append("modules", JSON.stringify(modulesData));

    // Append lesson videos
    formData.modules.forEach((mod, modIdx) => {
      mod.lessons.forEach((lesson, lessonIdx) => {
        if (lesson.video instanceof File) {
          data.append(`video_${modIdx}_${lessonIdx}`, lesson.video);
        }
      });
    });

    await dispatch(updateCourse({ id, data }));
    navigate("/instructor/dashboard");
  };

  if (loading) return <p className="text-center mt-10">Loading course...</p>;

  return (
    <div className="edit-course-container">
      <h2 className="page-title">✏️ Edit Course</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input name="title" placeholder="Course Title" value={formData.title} onChange={handleChange} className="input-field" required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="input-field" required />

        <div className="grid grid-cols-2 gap-4">
          <input name="price" type="number" placeholder="Price (₹)" value={formData.price} onChange={handleChange} className="input-field" />
          <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} className="input-field" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select name="level" value={formData.level} onChange={handleChange} className="input-field">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <input name="courseDuration" value={formattedTotalDuration} readOnly className="input-field bg-gray-100" />
        </div>

        <input name="skills_gain" placeholder="Skills (comma-separated)" value={formData.skills_gain} onChange={handleChange} className="input-field" />
        <input name="tags" placeholder="Tags (comma-separated)" value={formData.tags} onChange={handleChange} className="input-field" />

        <div>
          <label className="block font-semibold mb-2">Thumbnail</label>
          <input type="file" name="thumbnail" accept="image/*" onChange={handleChange} className="input-field" />
          {formData.thumbnail && !(formData.thumbnail instanceof File) && (
            <img src={formData.thumbnail} alt="Course Thumbnail" className="w-48 mt-3 rounded" />
          )}
        </div>

        {/* MODULES */}
        <h3 className="text-xl font-semibold mt-6">Modules & Lessons</h3>
        {formData.modules.map((mod, modIdx) => (
          <div key={modIdx} className="module-card">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-lg text-green-700">Module {modIdx + 1}</h4>
              {formData.modules.length > 1 && (
                <button type="button" onClick={() => removeModule(modIdx)} className="remove-btn">✕ Remove</button>
              )}
            </div>

            <input name="title" value={mod.title} onChange={(e) => handleModuleChange(modIdx, e)} placeholder="Module Title" className="input-field" />
            <textarea name="description" value={mod.description} onChange={(e) => handleModuleChange(modIdx, e)} placeholder="Module Description" className="input-field" />

            {mod.lessons.map((lesson, lessonIdx) => (
              <div key={lessonIdx} className="lesson-card">
                <input name="title" value={lesson.title} onChange={(e) => handleLessonChange(modIdx, lessonIdx, e)} placeholder="Lesson Title" className="input-field" />
                <input name="duration" value={lesson.duration} onChange={(e) => handleLessonChange(modIdx, lessonIdx, e)} placeholder="Duration (mins)" className="input-field" />
                <input type="file" name="video" accept="video/*" onChange={(e) => handleLessonChange(modIdx, lessonIdx, e)} className="input-field" />
                {lesson.videoUrl && <video src={lesson.videoUrl} controls className="mt-2 w-full rounded" />}
                <textarea name="description" value={lesson.description} onChange={(e) => handleLessonChange(modIdx, lessonIdx, e)} placeholder="Lesson Description" className="input-field" />
                {mod.lessons.length > 1 && (
                  <button type="button" onClick={() => removeLesson(modIdx, lessonIdx)} className="remove-btn">✕ Remove Lesson</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addLesson(modIdx)} className="add-btn">+ Add Lesson</button>
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <button type="button" onClick={addModule} className="add-btn">+ Add Module</button>
          <span className="text-sm text-gray-600">Total: {formattedTotalDuration}</span>
        </div>

        <div className="text-right mt-6">
          <button type="submit" className="save-btn">💾 Save Changes</button>
        </div>
      </form>
    </div>
  );
}
