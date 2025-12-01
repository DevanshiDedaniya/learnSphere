import API from "../../api/axiosConfig";

const enrollCourse = async (courseId) => {
  const res = await API.post(`/enrollments/${courseId}`);
  return res.data;
};

const getMyEnrollments = async () => {
  const res = await API.get("/enrollments/my");
  return res.data;
};

const enrollmentService = { enrollCourse, getMyEnrollments };
export default enrollmentService;
