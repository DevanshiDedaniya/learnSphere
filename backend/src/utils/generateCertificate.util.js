import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateCertificate = async ({ studentName, courseTitle, certificateId }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 50,
      });

      const dir = path.join(process.cwd(), "public", "certificates");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const fileName = `${certificateId}.pdf`;
      const filePath = path.join(dir, fileName);

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      const date = new Date().toLocaleDateString();

      doc.fontSize(42).text("Certificate of Completion", { align: "center" });
      doc.moveDown(1.5);
      doc.fontSize(22).text("This certifies that", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(32).text(studentName, { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(20).text("has successfully completed the course", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(28).text(courseTitle, { align: "center" });
      doc.moveDown(1.5);
      doc.fontSize(14).text(`Certificate ID: ${certificateId}`, { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(14).text(`Issued on: ${date}`, { align: "center" });

      doc.end();

      writeStream.on("finish", () => {
        resolve(`/certificates/${fileName}`); // Return standard relative URL
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      console.error("generateCertificate error:", err);
      reject(err);
    }
  });
};
