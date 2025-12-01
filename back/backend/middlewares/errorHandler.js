// middleware/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack);

  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

