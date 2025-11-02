const Joi = require('joi');

const stockTransferSchema = Joi.object({
  transfer_number: Joi.string().max(50).required(),
  from_warehouse_id: Joi.number().integer().required(),
  to_warehouse_id: Joi.number().integer().required()
    .invalid(Joi.ref('from_warehouse_id'))
    .messages({ 'any.invalid': 'Cannot transfer to the same warehouse' }),
  transfer_date: Joi.date().required(),
  expected_date: Joi.date().allow(null),
  status: Joi.string().valid('DRAFT', 'PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED', 'REJECTED').default('DRAFT'),
  notes: Joi.string().allow(null, ''),
  reason: Joi.string().max(255).allow(null, '')
});

module.exports = stockTransferSchema;
