import Enrollment from "../models/Enrollment.model.js";
import Certificate from "../models/Certificate.model.js";
import { generateCertificate } from "../utils/generateCertificate.util.js";
import crypto from "crypto";



export const issueCertificateService = async (enrollmentId, user) => {
  const enrollment = await Enrollment.findById(enrollmentId).populate("student course");

  if (!enrollment) {
    throw new Error("Enrollment not found", 404);
  }

  if (enrollment.status !== "completed") {
    throw new Error("Course not completed yet", 400);
  }

  if (enrollment.certificateIssued) {
    const cert = await Certificate.findOne({
      enrollment: enrollment._id,
    });

    return { certificate: cert, alreadyIssued: true };
  }

  const certificateId = `LS-${new Date().getFullYear()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;

  const certificateUrl = await generateCertificate({
    studentName: enrollment.student.fullName || enrollment.student.email,
    courseTitle: enrollment.course.title,
    certificateId,
  });

  const certificate = await Certificate.create({
    enrollment: enrollment._id,
    student: enrollment.student._id,
    course: enrollment.course._id,
    certificateId,
    certificateUrl,
    issueDate: new Date(),
  });

  enrollment.certificateIssued = true;
  await enrollment.save();

  return { certificate, alreadyIssued: false };
};



export const listCertificatesService = async (user) => {
  const { role, _id } = user;

  let certificates = [];

  if (role === "instructor") {
    certificates = await Certificate.find()
      .populate({
        path: "course",
        match: { instructor: _id },
        select: "title instructor",
      })
      .populate("student", "fullName email");

    certificates = certificates.filter((c) => c.course);
  } else {
    certificates = await Certificate.find({ student: _id })
      .populate("course", "title")
      .populate("student", "fullName email");
  }

  return {
    total: certificates.length,
    certificates,
  };
};

