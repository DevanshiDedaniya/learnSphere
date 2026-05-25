import express from "express";
import { signup, login, getProfile, updateProfile, uploadProfileImage } from "../controllers/auth.controller.js";
import auth from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { signupSchema, loginSchema, updateProfileSchema } from "../validation/auth.validation.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/profile", auth, authorize("student", "instructor"), getProfile);
router.put("/profile", auth, authorize("student", "instructor"), validate(updateProfileSchema), updateProfile);
router.post("/profile/image", auth, authorize("student", "instructor"), upload.single("profileImage"), uploadProfileImage);

export default router;
