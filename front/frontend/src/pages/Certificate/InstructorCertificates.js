// src/pages/instructor/InstructorCertificates.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/Certificates.css";

export default function InstructorCertificates() {
    const [enrollments, setEnrollments] = useState([]);
    const [loadingIssue, setLoadingIssue] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/enrollments/instructor", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEnrollments(res.data);
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
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("✅ Certificate issued successfully!");

            // ✅ Update the enrollment state to show it's issued
            setEnrollments((prev) =>
                prev.map((enr) =>
                    enr._id === enrollmentId
                        ? { ...enr, certificateIssued: true }
                        : enr
                )
            );
        } catch (err) {
            console.error("Error issuing certificate:", err);
            alert(err.response?.data?.message || "Error issuing certificate");
        } finally {
            setLoadingIssue(false);
        }
    };


    return (
        <div className="certificate-container">
            <h2>🎓 Certificates Management</h2>
            {enrollments.length > 0 ? (
                enrollments.map((enr) => (
                    <div key={enr._id} className="enrollment-row">
                        <div>
                            <p><b>{enr.student.fullName}</b></p>
                            <p>{enr.student.email}</p>
                            <p><b>Course:</b> {enr.course.title}</p>
                        </div>
                        <div>
                            {enr.status === "completed" ? (
                                enr.certificateIssued ? (
                                    <span className="issued-status">✅ Issued</span>
                                ) : (
                                    <button
                                        onClick={() => handleIssueCertificate(enr._id)}
                                        disabled={loadingIssue}
                                        className="issue-btn"
                                    >
                                        {loadingIssue ? "Issuing..." : "Issue Certificate"}
                                    </button>
                                )
                            ) : (
                                <span className="not-completed">Not Completed</span>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p>No enrollments found.</p>
            )}
        </div>
    );
}
