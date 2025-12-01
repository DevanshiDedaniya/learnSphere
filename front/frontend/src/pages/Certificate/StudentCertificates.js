// src/pages/student/StudentCertificates.js
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
                setCertificates(res.data.certificates || []);
            } catch (err) {
                console.error("Error fetching certificates:", err);
            }
        };
        fetchCertificates();
    }, [token]);

    const handleDownload = (cert) => {
        const link = document.createElement("a");
        link.href = cert.certificateUrl; // use the original secure_url
        link.download = `${cert.course.title}-certificate.pdf`; // optional, for download
        link.target = "_blank"; // open in new tab
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    return (
        <div className="certificate-container">
            <h2>🎓 My Certificates</h2>
            {certificates.length > 0 ? (
                certificates.map((cert) => (
                    <div key={cert._id} className="certificate-row">
                        <div>
                            <p><b>{cert.course.title}</b></p>
                            <p>Issued on: {new Date(cert.issueDate).toLocaleDateString()}</p>
                        </div>
                        <button className="download-btn" onClick={() => handleDownload(cert)}>
                            ⬇️ Download
                        </button>
                    </div>
                ))
            ) : (
                <p>No certificates yet.</p>
            )}
        </div>
    );
}
