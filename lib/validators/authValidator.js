const Joi = require('joi');

const signupSchema = Joi.object({
    userName: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
        .messages({ 'any.only': 'Passwords do not match' })
});

const loginSchema = Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().required()
});

const editUserNameSchema = Joi.object({
    userName: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    })
module.exports = { signupSchema, loginSchema ,editUserNameSchema};