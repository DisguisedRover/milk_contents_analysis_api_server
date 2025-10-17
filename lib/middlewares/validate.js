const joi = require('joi');

module.exports = (schema) => {
  return (req, res, next) => {
    if (!schema || !schema.validate) {
      console.error('Invalid schema provided:', schema);
      return res.status(500).json({ error: 'Validation schema not provided' });
    }

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }
    next();
  };
};
