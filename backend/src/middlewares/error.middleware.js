import logger from "../utils/logger.util.js";

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack ?? err.message);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default errorHandler;