import Joi from "joi";

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

export const createEnrollmentSchema = Joi.object({
  courseId: objectId.required(),
  paymentId: objectId.optional().allow(null),
});

export const enrollCourseParamsSchema = Joi.object({
  courseId: objectId.required(),
});

export const enrollCourseBodySchema = Joi.object({
  paymentId: objectId.optional().allow(null),
});

export const updateProgressSchema = Joi.object({
  lessonId: objectId.required(),
  watchedDuration: Joi.number().min(0).optional(),
  isCompleted: Joi.boolean().optional(),
});