import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/Certificates.css";

export default function StudentCertificates() {
  const [certificates, setCertificates] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/certificates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const certs = res.data?.data?.certificates || res.data?.certificates || [];
        setCertificates(Array.isArray(certs) ? certs : []);
      } catch (err) {
        console.error("Error fetching certificates:", err);
      }
    };
    fetchCertificates();
  }, [token]);

  const handleDownload = async (cert) => {
    try {
      const response = await fetch(`http://localhost:5000${cert.certificateUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${cert.course.title.replace(/\s+/g, '_')}-certificate.pdf`; 
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download certificate.");
    }
  };

  return (
    <div className="certificate-wrapper">
      <div className="certificate-container">
        <div className="certificate-header">
          <h2>🎓 My Certificates</h2>
        </div>

        {certificates.length > 0 ? (
          <div className="certificate-grid">
            {certificates.map((cert) => (
              <div key={cert._id} className="certificate-card">
                <div className="card-content">
                  <h3>{cert.course.title}</h3>
                  <div className="card-meta">
                    <span><strong>Issued on:</strong> {new Date(cert.issueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleDownload(cert)}
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">📄</span>
            <p>No certificates yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
