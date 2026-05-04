const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  price: Joi.number().precision(2).min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  category: Joi.string().trim().min(2).max(80).required()
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120),
  price: Joi.number().precision(2).min(0),
  stock: Joi.number().integer().min(0),
  category: Joi.string().trim().min(2).max(80)
}).min(1);

module.exports = {
  createProductSchema,
  updateProductSchema
};
