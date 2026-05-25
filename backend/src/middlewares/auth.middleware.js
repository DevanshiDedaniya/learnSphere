import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { error } from "../utils/response.util.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      error(res, "Unauthorized", 401);
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return error(res, "Unauthorized", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id || !decoded.role) {
      return error(res, "Invalid token payload", 401);
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return error(res, "User not found", 401);
    }

    req.user = user;
    next();
  } catch {
    return error(res, "Invalid or expired token", 401);
  }
};

export default auth;
