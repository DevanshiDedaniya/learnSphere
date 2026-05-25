import Joi from "joi";

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

export const createPaymentIntentSchema = Joi.object({
  courseId: objectId.required(),
});

export const stripeWebhookSchema = Joi.object({
  type: Joi.string().required(),
  data: Joi.object({
    object: Joi.object({
      id: Joi.string().required(),
      metadata: Joi.object({
        courseId: objectId.optional(),
        userId: objectId.optional(),
      }).optional(),
    }).required(),
  }).required(),
});