const salesOrderSchema = Joi.object({
  customer_name: Joi.string().max(100).required(),
  customer_contact: Joi.string().max(100).allow(null, ''),
  warehouse_id: Joi.number().integer().required(),
  order_number: Joi.string().max(50).required(),
  order_date: Joi.date().required(),
  delivery_date: Joi.date().allow(null),
  status: Joi.string().valid('DRAFT', 'PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED').default('DRAFT'),
  payment_status: Joi.string().valid('UNPAID', 'PARTIAL', 'PAID').default('UNPAID'),
  total_amount: Joi.number().precision(2).default(0),
  tax_amount: Joi.number().precision(2).default(0),
  discount_amount: Joi.number().precision(2).default(0),
  notes: Joi.string().allow(null, '')
});

module.exports = salesOrderSchema;
