import API from "../../api/axiosConfig";

// 🔹 Get all certificates (for instructor/student)
const getCertificates = async () => {
  const res = await API.get("/certificates");
  // backend: data = { total, certificates }
  return res.data?.data;
};

// 🔹 Issue certificate for a specific enrollment
const issueCertificate = async (enrollmentId) => {
  const res = await API.post(`/certificates/issue/${enrollmentId}`);
  // backend: data = { certificate, alreadyIssued }
  return {
    ...(res.data?.data || {}),
    message: res.data?.message,
  };
};

const certificateService = { getCertificates, issueCertificate };
export default certificateService;



// import html2pdf from "html2pdf.js";

// const generateAndUploadCertificate = async () => {
//   const element = document.getElementById("certificate");

//   const pdfBlob = await html2pdf()
//     .from(element)
//     .outputPdf("blob");

//   const url = await uploadCertificateToCloudinary(pdfBlob);

//   console.log("Uploaded Certificate:", url);
// };

// const issueCertificate = async () => {
//   // 1️⃣ Get PDF from backend
//   const res = await fetch("/api/certificate/generate", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       studentName: "Devanshi",
//       courseTitle: "Full Stack Development",
//       certificateId: "LS-2026-AB12",
//     }),
//   });

//   const pdfBlob = await res.blob(); // 👈 PDF file

//   // 2️⃣ Upload PDF to Cloudinary
//   const url = await uploadCertificateToCloudinary(pdfBlob);

//   console.log("Certificate URL:", url);

//   // 3️⃣ Save URL in backend
//   await fetch("/api/certificate/save", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ certificateUrl: url }),
//   });
// };

// const uploadCertificateToCloudinary = async (pdfBlob) => {
//   const formData = new FormData();
//   formData.append("file", pdfBlob);
//   formData.append("upload_preset", "learnsphere"); // your preset
//   formData.append("folder", "learnsphere/certificates");

//   const res = await fetch(
//     "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/raw/upload",
//     {
//       method: "POST",
//       body: formData,
//     }
//   );

//   const data = await res.json();
//   return data.secure_url;
// };
