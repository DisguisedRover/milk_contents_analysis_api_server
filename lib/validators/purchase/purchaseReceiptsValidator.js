const purchaseReceiptSchema = Joi.object({
  receipt_number: Joi.string().max(50).required(),
  po_id: Joi.number().integer().required(),
  warehouse_id: Joi.number().integer().required(),
  supplier_id: Joi.number().integer().required(),
  receipt_date: Joi.date().required(),
  invoice_number: Joi.string().max(50).allow(null, ''),
  invoice_date: Joi.date().allow(null),
  total_amount: Joi.number().precision(2).default(0),
  status: Joi.string().valid('DRAFT', 'RECEIVED', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED').default('DRAFT'),
  notes: Joi.string().allow(null, '')
});

module.exports = purchaseReceiptSchema;
