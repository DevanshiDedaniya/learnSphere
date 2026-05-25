import Joi from "joi";

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

export const issueCertificateParamsSchema = Joi.object({
  enrollmentId: objectId.required(),
}).unknown(false);

export const listCertificatesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
}).unknown(false);
