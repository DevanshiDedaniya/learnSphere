import Joi from "joi";

export const createCourseSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().optional(),
  level: Joi.string().valid("beginner", "intermediate", "advanced").optional(),
  courseDuration: Joi.number().min(1).optional(),

  skills_gain: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),

  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),

  modules: Joi.alternatives().try(
    Joi.array().items(
      Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        lessons: Joi.array().items(
          Joi.object({
            title: Joi.string().required(),
            description: Joi.string().optional(),
            duration: Joi.number().optional(),
            videoUrl: Joi.string().uri().optional(),
          })
        ),
      })
    ),
    Joi.string()
  ).optional(),
});


export const updateCourseSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().min(10).optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().optional(),
  level: Joi.string().valid("beginner", "intermediate", "advanced").optional(),
  courseDuration: Joi.number().min(1).optional(),
  thumbnail: Joi.string().uri().optional(),

  skills_gain: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),

  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),

  modules: Joi.alternatives().try(
    Joi.array(),
    Joi.string()
  ).optional(),
});