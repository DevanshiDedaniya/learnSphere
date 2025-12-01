import API from "../../api/axiosConfig";

// 🔹 Get all certificates (for instructor/student)
const getCertificates = async () => {
  const res = await API.get("/certificates");
  return res.data;
};

// 🔹 Issue certificate for a specific enrollment
const issueCertificate = async (enrollmentId) => {
  const res = await API.post(`/certificates/issue/${enrollmentId}`);
  return res.data;
};

const certificateService = { getCertificates, issueCertificate };
export default certificateService;
