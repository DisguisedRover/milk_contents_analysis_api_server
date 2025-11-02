const Joi = require('joi');

const reorderLevelSchema = Joi.object({
  product_id: Joi.number().integer().required(),
  warehouse_id: Joi.number().integer().required(),
  min_quantity: Joi.number().precision(2).required(),
  max_quantity: Joi.number().precision(2).required(),
  reorder_quantity: Joi.number().precision(2).required(),
  reorder_point: Joi.number().precision(2).required(),
  lead_time_days: Joi.number().integer().default(0),
  safety_stock: Joi.number().precision(2).default(0),
  is_active: Joi.boolean().default(true)
});

module.exports = reorderLevelSchema;