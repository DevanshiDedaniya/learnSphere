import API from "../../api/axiosConfig";

const enrollCourse = async (courseId, paymentId = null) => {
  const res = await API.post(`/enrollments/${courseId}`, { paymentId });
  return res.data?.data;
};

const getMyEnrollments = async () => {
  const res = await API.get("/enrollments/my");
  return res.data?.data;
};

const enrollmentService = { enrollCourse, getMyEnrollments };
export default enrollmentService;
