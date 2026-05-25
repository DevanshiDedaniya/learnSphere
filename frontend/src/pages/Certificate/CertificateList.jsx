import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCertificates } from "../../features/certificate/certificateSlice";
import "../../styles/Certificates.css";

export default function CertificateList() {
  const dispatch = useDispatch();
  const { certificates, loading } = useSelector((state) => state.certificate);

  useEffect(() => {
    dispatch(fetchCertificates());
  }, [dispatch]);

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

  if (loading) {
    return (
      <div className="certificate-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--cert-primary)', fontWeight: 600 }}>Loading certificates...</p>
      </div>
    );
  }

  return (
    <div className="certificate-wrapper">
      <div className="certificate-container">
        <div className="certificate-header">
          <h2>🎓 My Certificates</h2>
        </div>

        {certificates.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📄</span>
            <p>No certificates issued yet.</p>
          </div>
        ) : (
          <div className="certificate-grid">
            {certificates.map((cert) => (
              <div key={cert._id} className="certificate-card">
                <div className="card-content">
                  <h3>{cert.course.title}</h3>
                  <div className="card-meta">
                    <span><strong>Issued on:</strong> {new Date(cert.issueDate).toLocaleDateString()}</span>
                    <span><strong>Certificate ID:</strong> {cert.certificateId}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => handleDownload(cert)}
                    className="btn-primary"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
