import multer from "multer";

const storage = multer.memoryStorage();

const courseUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max file size (useful for videos)
  },
  fileFilter: (req, file, cb) => {
    // We can allow both images and videos
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed!"), false);
    }
  },
});

export default courseUpload;
