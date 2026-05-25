import API from "../../api/axiosConfig";

const getAllCourses = async (searchTerm = "") => {
  const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : "";
  const res = await API.get(`/courses${query}`);
  return res.data?.data;
};

const getCourseById = async (id) => {
  const res = await API.get(`/courses/${id}`);
  return res.data?.data;
};

const createCourse = async (data) => {
  const res = await API.post("/courses/create", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data?.data;
};


const getInstructorCourses = async () => {
  const res = await API.get("/courses/instructor");
  return res.data?.data;
};



const rateCourse = async (courseId, ratingData) => {
  const res = await API.post(`/courses/rate/${courseId}`, ratingData);
  return res.data;
};

const deleteCourse = async (id) => {
  await API.delete(`/courses/${id}`);
  return;
};

const updateCourse = async (id, data) => {
  const res = await API.put(`/courses/update/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data?.data;
};

const courseService = {
  getAllCourses,
  getCourseById,
  createCourse,
  getInstructorCourses,
  rateCourse,
  deleteCourse,
  updateCourse,
};

export default courseService;





// import { useState } from "react";
// import axios from "axios";
// import { uploadToCloudinary } from "../utils/cloudinaryUpload";

// const CreateCourse = () => {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [thumbnailFile, setThumbnailFile] = useState(null);
//   const [videoFile, setVideoFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);

//       // ✅ 1) Upload thumbnail to Cloudinary
//       const thumbRes = await uploadToCloudinary(thumbnailFile, "course_thumbnails");
//       const thumbnailUrl = thumbRes.secure_url;

//       // ✅ 2) Upload video to Cloudinary
//       const videoRes = await uploadToCloudinary(videoFile, "course_videos");
//       const videoUrl = videoRes.secure_url;

//       // ✅ 3) Send URLs to backend
//       const token = localStorage.getItem("token");

//       const res = await axios.post(
//         "http://localhost:5000/api/courses",
//         {
//           title,
//           description,
//           thumbnail: thumbnailUrl,
//           modules: [
//             {
//               title: "Module 1",
//               lessons: [
//                 {
//                   title: "Intro",
//                   videoUrl: videoUrl,
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       alert("Course created successfully ✅");
//       console.log(res.data);
//     } catch (err) {
//       console.error(err);
//       alert("Error creating course ❌");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Create Course</h2>

//       <input
//         type="text"
//         placeholder="Course Title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         required
//       />

//       <textarea
//         placeholder="Description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         required
//       />

//       <input
//         type="file"
//         accept="image/*"
//         onChange={(e) => setThumbnailFile(e.target.files[0])}
//         required
//       />

//       <input
//         type="file"
//         accept="video/*"
//         onChange={(e) => setVideoFile(e.target.files[0])}
//         required
//       />

//       <button type="submit" disabled={loading}>
//         {loading ? "Uploading..." : "Create Course"}
//       </button>
//     </form>
//   );
// };

// export default CreateCourse;


// const uploadLessons = async (lessons) => {
//   const uploadedLessons = [];

//   for (const lesson of lessons) {
//     const videoRes = await uploadToCloudinary(lesson.file, "course_videos");

//     uploadedLessons.push({
//       title: lesson.title,
//       videoUrl: videoRes.secure_url,
//     });
//   }

//   return uploadedLessons;
// };


// const handleAddLesson = async () => {
//   // Upload video to Cloudinary first
//   const videoRes = await uploadToCloudinary(videoFile, "course_videos");
//   const videoUrl = videoRes.secure_url;

//   // Send lesson data to backend
//   const token = localStorage.getItem("token");
//   await axios.post(
//     `http://localhost:5000/api/courses/${courseId}/modules/${moduleId}/lessons`,
//     {
//       title: lessonTitle,
//       description: lessonDescription,
//       duration: lessonDuration,
//       videoUrl, // directly from Cloudinary
//     },
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
// };