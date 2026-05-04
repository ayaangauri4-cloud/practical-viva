require('dotenv').config();

const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_ecommerce_api',
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
  accessExpiry: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshExpiry: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
};

module.exports = { env };
