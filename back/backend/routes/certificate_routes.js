import express from "express";
import { issueCertificate, listCertificates } from "../controllers/certificateController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Only instructor can issue certificates
router.post("/issue/:enrollmentId", authMiddleware(["instructor"]), issueCertificate);

// list certificates (admin/instructor/student)
router.get("/", authMiddleware(), listCertificates);

export default router;
