import API from "../../api/axiosConfig";
import axios from "axios";


// 🌍 Get all public courses
const getAllCourses = async (searchTerm = "") => {
  const query = searchTerm ? `?q=${encodeURIComponent(searchTerm)}` : "";
  const res = await axios.get(`http://localhost:5000/api/courses${query}`);
  return res.data;
};


// 📘 Get a single course by ID
const getCourseById = async (id) => {
  const res = await API.get(`/courses/${id}`);
  return res.data;
};

// 🧑‍🏫 Create a new course (Instructor only)
const createCourse = async (data) => {
  const token = localStorage.getItem("token");

  const res = await API.post("/courses/create", data, {
    headers: {
      Authorization: `Bearer ${token}`,
      // 👇 Important if you're sending FormData (for thumbnail upload)
      "Content-Type": "multipart/form-data",
    },
  });

  // ✅ Return the actual course object (not wrapped in `message`)
  return res.data.course;
};

// 🧑‍🏫 Fetch courses created by the logged-in instructor
const getInstructorCourses = async () => {
  const token = localStorage.getItem("token");

  const res = await API.get("/courses/instructor", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

// ⭐ Rate a course (Student only)
const rateCourse = async (courseId, ratingData) => {
  const token = localStorage.getItem("token");

  const res = await API.post(`/courses/${courseId}/rate`, ratingData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return res.data;
};

const deleteCourse = async (id) => {
  const token = localStorage.getItem("token");
  const res = await API.delete(`/courses/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const updateCourse = async (id, data) => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const res = await API.put(`/courses/update/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};


const courseService = {
  getAllCourses,
  getCourseById,
  createCourse,
  getInstructorCourses,
  rateCourse,
  deleteCourse,
  updateCourse
};

export default courseService;
