import { error } from "../utils/response.util.js";

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      error(res, "Unauthorized", 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      error(res, "Access denied", 403);
      return;
    }

    next();
  };
};

export default authorize;
