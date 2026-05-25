import { success, error } from "../utils/response.util.js";
import {issueCertificateService,listCertificatesService,} from "../services/certificate.service.js";


export const issueCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const { certificate, alreadyIssued } = await issueCertificateService(
      enrollmentId,
      req.user
    );

    if (alreadyIssued) {
      return success(res, certificate, "Certificate already issued", 200);
    }

    return success(res, certificate, "Certificate issued successfully", 201);
  } catch (err) {
    console.error("issueCertificate error:", err);
    const status = err.statusCode || 500;
    const message = status === 500 ? "Server error" : err.message || "Server error";
    return error(res, message, status);
  }
};



export const listCertificates = async (req, res) => {
  try {
    const data = await listCertificatesService(req.user);

    return success(res, data, "Certificates fetched successfully", 200);
  } catch (err) {
    console.error("listCertificates error:", err);
    const status = err.statusCode || 500;
    const message = status === 500 ? "Server error" : err.message || "Server error";
    return error(res, message, status);
  }
};
