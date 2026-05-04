const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    env.accessSecret,
    { expiresIn: env.accessExpiry }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    env.refreshSecret,
    { expiresIn: env.refreshExpiry }
  );

module.exports = {
  signAccessToken,
  signRefreshToken
};
