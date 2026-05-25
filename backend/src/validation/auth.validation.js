import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).unknown(false);

export const signupSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("student", "instructor").default("student"),
}).unknown(false);

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).optional(),
  username: Joi.string().min(3).max(30).optional(),
  bio: Joi.string().max(500).optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  profileImage: Joi.string().uri().optional(),

  instructorProfile: Joi.object({
    title: Joi.string().optional(),
    totalCourses: Joi.number().min(0).optional(),
    totalStudents: Joi.number().min(0).optional(),
    averageRating: Joi.number().min(0).max(5).optional(),
  }).optional(),
}).min(1).unknown(false);