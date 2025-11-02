const paymentsSchema = Joi.object({
  payment_number: Joi.string().max(50).required(),
  reference_type: Joi.string().valid('PURCHASE', 'SALE').required(),
  reference_id: Joi.number().integer().required(),
  payment_date: Joi.date().required(),
  amount: Joi.number().precision(2).required(),
  payment_method: Joi.string().valid('CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'MOBILE_PAYMENT', 'OTHER').required(),
  transaction_reference: Joi.string().max(100).allow(null, ''),
  bank_name: Joi.string().max(100).allow(null, ''),
  cheque_number: Joi.string().max(50).allow(null, ''),
  cheque_date: Joi.date().allow(null),
  notes: Joi.string().allow(null, ''),
  status: Joi.string().valid('PENDING', 'COMPLETED', 'CANCELLED', 'FAILED').default('COMPLETED')
});

module.exports = paymentsSchema;
