import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCertificates } from "../../features/certificate/certificateSlice";

export default function CertificateList() {
  const dispatch = useDispatch();
  const { certificates, loading } = useSelector((state) => state.certificate);

  useEffect(() => {
    dispatch(fetchCertificates());
  }, [dispatch]);

  if (loading) return <p className="text-center mt-10">Loading certificates...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🎓 My Certificates</h2>

      {certificates.length === 0 ? (
        <p className="text-gray-500">No certificates issued yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold text-lg">{cert.course.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Issued on {new Date(cert.issueDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Certificate ID: {cert.certificateId}</p>

              <a
                href={cert.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                ⬇️ Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
