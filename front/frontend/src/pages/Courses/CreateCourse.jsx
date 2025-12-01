import React, { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { createCourse } from "../../features/course/courseSlice";
import { useNavigate } from "react-router-dom";
import "../../styles/CreateCourse.css";

export default function CreateCourse() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    courseDuration: "", // will be auto-computed (in minutes)
    category: "",
    level: "beginner",
    skills_gain: "",
    tags: "",
    thumbnail: null,
    modules: [
      {
        title: "",
        description: "",
        lessons: [
          { title: "", description: "", duration: "", video: null } // duration in minutes (number)
        ],
      },
    ],
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // compute total duration (minutes) from all lesson.duration fields
  const totalDurationMinutes = useMemo(() => {
    return formData.modules.reduce((modAcc, mod) => {
      const lessonsSum = (mod.lessons || []).reduce((lAcc, l) => {
        const d = Number(l.duration) || 0;
        return lAcc + d;
      }, 0);
      return modAcc + lessonsSum;
    }, 0);
  }, [formData.modules]);

  // format minutes to "X hrs Y mins"
  const formattedTotalDuration = useMemo(() => {
    const mins = totalDurationMinutes;
    if (!mins) return "0 mins";
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours} hr${hours > 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}` : `${minutes} mins`;
  }, [totalDurationMinutes]);

  // generic top-level change (title, description, thumbnail, etc.)
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

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [
        ...formData.modules,
        { title: "", description: "", lessons: [{ title: "", description: "", duration: "", video: null }] },
      ],
    });
  };

  const removeModule = (index) => {
    const updated = formData.modules.filter((_, i) => i !== index);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Use computed totalDurationMinutes as courseDuration (minutes)
    const computedCourseDuration = totalDurationMinutes;

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    // pass courseDuration (minutes). Backend will store number.
    data.append("courseDuration", String(computedCourseDuration));
    data.append("category", formData.category);
    data.append("level", formData.level);
    // send skills and tags as arrays (frontend lets user enter comma-separated)
    const skillsArr = formData.skills_gain ? formData.skills_gain.split(",").map(s => s.trim()).filter(Boolean) : [];
    const tagsArr = formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    data.append("skills_gain", JSON.stringify(skillsArr));
    data.append("tags", JSON.stringify(tagsArr));

    if (formData.thumbnail) data.append("thumbnail", formData.thumbnail);

    // Build modules structure for backend; embed lesson.videoField keys for file mapping
    const modulesForBackend = formData.modules.map((mod, modIdx) => ({
      title: mod.title,
      description: mod.description,
      lessons: mod.lessons.map((lesson, lessonIdx) => ({
        title: lesson.title,
        description: lesson.description,
        duration: Number(lesson.duration) || 0,
        videoField: `video_${modIdx}_${lessonIdx}`,
      })),
    }));

    data.append("modules", JSON.stringify(modulesForBackend));

    // Append all lesson video files using same naming convention
    formData.modules.forEach((mod, modIdx) => {
      mod.lessons.forEach((lesson, lessonIdx) => {
        if (lesson.video) {
          data.append(`video_${modIdx}_${lessonIdx}`, lesson.video);
        }
      });
    });

    dispatch(createCourse(data)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        navigate("/instructor/dashboard");
      } else {
        console.error("Create course failed:", res);
        alert("Error creating course — check console for details.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Create Course</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <input name="title" placeholder="Course Title" value={formData.title} onChange={handleChange} className="input-field" required />
        <textarea name="description" placeholder="Course Description" value={formData.description} onChange={handleChange} className="input-field" required />

        <div className="grid grid-cols-2 gap-4">
          <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} className="input-field" />
          {/* Display computed duration read-only */}
          <input name="courseDuration" placeholder="Total Duration (auto)" value={formattedTotalDuration} readOnly className="input-field bg-gray-100" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input name="category" placeholder="Category" value={formData.category} onChange={handleChange} className="input-field" />
          <select name="level" value={formData.level} onChange={handleChange} className="input-field">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input name="skills_gain" placeholder="Skills (comma-separated)" value={formData.skills_gain} onChange={handleChange} className="input-field" />
          <input name="tags" placeholder="Tags (comma-separated)" value={formData.tags} onChange={handleChange} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Thumbnail (course image)</label>
          <input type="file" name="thumbnail" accept="image/*" onChange={handleChange} className="input-field" />
        </div>

        <hr className="my-4" />

        {/* Modules */}
        <h3 className="text-xl font-semibold">Modules & Lessons</h3>

        {formData.modules.map((mod, modIndex) => (
          <div key={modIndex} className="border p-5 rounded-md mb-6 bg-gray-50 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-lg text-green-700">Module {modIndex + 1}</h4>
              {formData.modules.length > 1 && (
                <button type="button" onClick={() => removeModule(modIndex)} className="text-red-500 text-sm">✕ Remove Module</button>
              )}
            </div>

            <input name="title" placeholder="Module Title" value={mod.title} onChange={(e) => handleModuleChange(modIndex, e)} className="input-field" required />
            <textarea name="description" placeholder="Module Description" value={mod.description} onChange={(e) => handleModuleChange(modIndex, e)} className="input-field" />

            <div className="space-y-4 mt-4">
              {mod.lessons.map((lesson, lessonIndex) => (
                <div key={lessonIndex} className="border p-4 rounded-md mb-4 bg-white space-y-3">
                  <input placeholder="Lesson Title" value={lesson.title} onChange={(e) => handleLessonChange(modIndex, lessonIndex, e)} name="title" className="input-field" required />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Duration (minutes)" value={lesson.duration} onChange={(e) => handleLessonChange(modIndex, lessonIndex, e)} name="duration" className="input-field" />
                    <input type="file" accept="video/*" onChange={(e) => handleLessonChange(modIndex, lessonIndex, e)} name="video" className="input-field" />
                  </div>
                  <textarea placeholder="Lesson Description" value={lesson.description} onChange={(e) => handleLessonChange(modIndex, lessonIndex, e)} name="description" className="input-field" />
                  {mod.lessons.length > 1 && (
                    <button type="button" onClick={() => removeLesson(modIndex, lessonIndex)} className="text-red-500 text-sm">✕ Remove Lesson</button>
                  )}
                </div>
              ))}
            </div>

            <button type="button" onClick={() => addLesson(modIndex)} className="text-blue-600 text-sm">+ Add Lesson</button>
          </div>
        ))}

        <div className="flex items-center gap-4">
          <button type="button" onClick={addModule} className="bg-gray-200 px-3 py-1 rounded-md text-sm">+ Add Module</button>
          <span className="ml-auto text-sm text-gray-600">Total duration: <strong>{formattedTotalDuration}</strong></span>
        </div>

        <div className="text-right mt-6">
          <button type="submit" className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800">Create Course</button>
        </div>
      </form>
    </div>
  );
}
