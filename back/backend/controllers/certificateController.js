import Enrollment from "../models/Enrollment.js";
import Certificate from "../models/Certificate.js";
import { createCertificateAndUpload } from "../utils/generateCertificate.js";
import crypto from "crypto";

export const issueCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    // 1️⃣ Fetch enrollment with student and course
    const enrollment = await Enrollment.findById(enrollmentId).populate("student course");
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    // 2️⃣ Check permissions: only student or instructor/admin can issue
    const isInstructor = String(enrollment.course.instructor) === String(req.user._id);
    if (String(enrollment.student._id) !== String(req.user._id) && !isInstructor) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 3️⃣ Check course completion
    if (enrollment.status !== "completed") {
      return res.status(400).json({ message: "Course not completed yet" });
    }

    // 4️⃣ If certificate already issued, return existing one
    if (enrollment.certificateIssued) {
      const cert = await Certificate.findOne({ enrollment: enrollment._id });
      return res.json({ message: "Already issued", certificate: cert });
    }

    // 5️⃣ Generate unique certificate ID
    const certificateId = `LS-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // 6️⃣ Generate PDF and upload to Cloudinary
    const certificateUrl = await createCertificateAndUpload({
      studentName: enrollment.student.fullName || enrollment.student.email,
      courseTitle: enrollment.course.title,
      certificateId
    });

    // 7️⃣ Save certificate in DB
    const certificate = await Certificate.create({
      enrollment: enrollment._id,
      student: enrollment.student._id,
      course: enrollment.course._id,
      certificateId,
      certificateUrl,
      issueDate: new Date()
    });

    // 8️⃣ Mark enrollment as having a certificate
    enrollment.certificateIssued = true;
    await enrollment.save();

    // 9️⃣ Return certificate
    res.json({ message: "Certificate issued", certificate });
  } catch (err) {
    console.error("issueCertificate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const listCertificates = async (req, res) => {
  try {
    const { role, _id } = req.user;

    let certificates;

    if (role === "instructor") {
      // Instructor sees certificates for their courses
      certificates = await Certificate.find()
        .populate({
          path: "course",
          match: { instructor: _id },
          select: "title instructor",
        })
        .populate("student", "fullName email");

      // Remove nulls (courses not owned by instructor)
      certificates = certificates.filter((c) => c.course !== null);
    } else {
      // Student sees their own certificates
      certificates = await Certificate.find({ student: _id })
        .populate("course", "title")
        .populate("student", "fullName email");
    }

    res.json({ total: certificates.length, certificates });
  } catch (err) {
    console.error("listCertificates error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
