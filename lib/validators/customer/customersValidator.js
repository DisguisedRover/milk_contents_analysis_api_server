const Joi = require('joi');

const customersSchema = Joi.object({
  customer_code: Joi.string().max(20).required(),
  customer_name: Joi.string().max(100).required(),
  customer_type: Joi.string().valid('INDIVIDUAL', 'BUSINESS').default('INDIVIDUAL'),
  contact_person: Joi.string().max(50).allow(null, ''),
  email: Joi.string().max(100).email().allow(null, ''),
  phone: Joi.string().max(20).allow(null, ''),
  mobile: Joi.string().max(20).allow(null, ''),
  address: Joi.string().allow(null, ''),
  city: Joi.string().max(50).allow(null, ''),
  state: Joi.string().max(50).allow(null, ''),
  country: Joi.string().max(50).default('Nepal'),
  postal_code: Joi.string().max(10).allow(null, ''),
  tax_id: Joi.string().max(50).allow(null, ''),
  pan_number: Joi.string().max(20).allow(null, ''),
  credit_limit: Joi.number().precision(2).default(0),
  payment_terms: Joi.string().max(50).allow(null, ''),
  notes: Joi.string().allow(null, ''),
  is_active: Joi.boolean().default(true)
});

module.exports = customersSchema;
