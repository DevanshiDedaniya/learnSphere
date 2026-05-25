import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/Certificates.css";

export default function InstructorCertificates() {
  const [enrollments, setEnrollments] = useState([]);
  const [loadingIssue, setLoadingIssue] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    const fetchEnrollments = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/enrollments/instructor",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = res.data?.data?.enrollments || res.data?.enrollments || res.data || [];
        setEnrollments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching enrollments:", err);
      }
    };
    fetchEnrollments();
  }, [token]);

  const handleIssueCertificate = async (enrollmentId) => {
    try {
      setLoadingIssue(true);

      await axios.post(
        `http://localhost:5000/api/certificates/issue/${enrollmentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Certificate issued successfully!");

      setEnrollments((prev) =>
        prev.map((enr) =>
          enr._id === enrollmentId ? { ...enr, certificateIssued: true } : enr,
        ),
      );
    } catch (err) {
      console.error("Error issuing certificate:", err);
      alert(err.response?.data?.message || "Error issuing certificate");
    } finally {
      setLoadingIssue(false);
    }
  };

  return (
    <div className="certificate-wrapper">
      <div className="certificate-container">
        <div className="certificate-header">
          <h2>🎓 Certificates Management</h2>
        </div>

        {enrollments.length > 0 ? (
          <div className="certificate-grid">
            {enrollments.map((enr) => (
              <div key={enr._id} className="certificate-card">
                <div className="card-content">
                  <h3>{enr.student.fullName}</h3>
                  <div className="card-meta">
                    <span><strong>Email:</strong> {enr.student.email}</span>
                    <span><strong>Course:</strong> {enr.course.title}</span>
                  </div>
                </div>

                <div className="card-actions">
                  {enr.status === "completed" ? (
                    enr.certificateIssued ? (
                      <span className="cert-status-badge status-issued">✅ Issued</span>
                    ) : (
                      <button
                        onClick={() => handleIssueCertificate(enr._id)}
                        disabled={loadingIssue}
                        className="btn-primary"
                      >
                        {loadingIssue ? "Issuing..." : "Issue Certificate"}
                      </button>
                    )
                  ) : (
                    <span className="cert-status-badge status-pending">Not Completed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📄</span>
            <p>No student enrollments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
