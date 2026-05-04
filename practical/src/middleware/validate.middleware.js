const ApiError = require('../utils/apiError');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join(', ');
    return next(new ApiError(400, message));
  }

  req.body = value;
  next();
};

module.exports = validate;
