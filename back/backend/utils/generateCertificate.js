import PDFDocument from "pdfkit";
import cloudinary from "./cloudinary.js";
import { Readable } from "stream";

export const createCertificateAndUpload = async ({ studentName, courseTitle, certificateId }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", layout: "landscape" });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          //console.log("PDF Buffer size:", pdfBuffer.length); // should be >10 KB

          const readable = new Readable();
          readable.push(pdfBuffer);
          readable.push(null);

          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "raw", // must be raw
              folder: "learnsphere/certificates",
              public_id: certificateId,
              overwrite: true,
              format: "pdf",
              type: "upload",       // public
            },
            (err, result) => {
              if (err) return reject(err);
              resolve(result.secure_url);
            }
          );

          readable.pipe(uploadStream);
        } catch (err) {
          reject(err);
        }
      });

      // --- PDF content ---
      const date = new Date().toLocaleDateString();
      doc.fontSize(40).text("Certificate of Completion", { align: "center", underline: true });
      doc.moveDown(1.5);
      doc.fontSize(24).text("This certifies that", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(30).text(studentName, { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(20).text("has successfully completed the course", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(26).text(courseTitle, { align: "center" });
      doc.moveDown(1.2);
      doc.fontSize(16).text(`Certificate ID: ${certificateId}`, { align: "center" });
      doc.moveDown(1.2);
      doc.fontSize(14).text(`Issued on: ${date}`, { align: "center" });
      doc.moveDown(2);
      doc.fontSize(12).text("LearnSphere © 2025", { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
