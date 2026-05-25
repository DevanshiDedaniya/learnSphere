import express from "express";
import { issueCertificate, listCertificates } from "../controllers/certificate.controller.js";
import auth from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { issueCertificateParamsSchema, listCertificatesQuerySchema } from "../validation/certificate.validation.js";

const router = express.Router();

router.post("/issue/:enrollmentId", auth, authorize("instructor"), validate(issueCertificateParamsSchema, "params"), issueCertificate);
router.get("/", auth, authorize("student", "instructor"), validate(listCertificatesQuerySchema, "query"), listCertificates);

export default router;
