import Joi from 'joi';

export const insightSchema = Joi.object({
  tenantId: Joi.number().integer().required(),
  queryText: Joi.string().min(3).required(),
});