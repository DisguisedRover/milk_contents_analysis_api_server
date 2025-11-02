const customerAddressSchema = Joi.object({
  customer_id: Joi.number().integer().required(),
  address_type: Joi.string().valid('BILLING', 'SHIPPING', 'BOTH').default('BOTH'),
  address_line1: Joi.string().max(255).required(),
  address_line2: Joi.string().max(255).allow(null, ''),
  city: Joi.string().max(50).allow(null, ''),
  state: Joi.string().max(50).allow(null, ''),
  country: Joi.string().max(50).default('Nepal'),
  postal_code: Joi.string().max(10).allow(null, ''),
  is_default: Joi.boolean().default(false),
  is_active: Joi.boolean().default(true)
});

module.exports = customerAddressSchema;
