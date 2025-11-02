const Joi = require('joi');

const purchaseOrderSchema = Joi.object({
  supplier_id: Joi.number().integer().required(),
  warehouse_id: Joi.number().integer().required(),
  po_number: Joi.string().max(50).required(),
  order_date: Joi.date().required(),
  expected_date: Joi.date().allow(null),
  status: Joi.string().valid('DRAFT', 'PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED').default('DRAFT'),
  total_amount: Joi.number().precision(2).default(0),
  tax_amount: Joi.number().precision(2).default(0),
  notes: Joi.string().allow(null, '')
});

module.exports = purchaseOrderSchema;
