const Joi =  require('joi');

const categorySchema = Joi.object({
  name: Joi.string().max(50).required(),
  parent_id: Joi.number().integer().allow(null),
  description: Joi.string().allow(null, ''),
  is_active: Joi.boolean().default(true)
});

module.exports = categorySchema;
