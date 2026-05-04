const app = require('./app');
const connectDB = require('./config/db');
const { env } = require('./config/env');

const listenWithRetry = (preferredPort, attempts = 10) =>
  new Promise((resolve, reject) => {
    const tryListen = (port, remainingAttempts) => {
      const server = app.listen(port, () => {
        console.log(`Secure E-Commerce API running on port ${port}`);
        resolve(server);
      });

      server.once('error', (error) => {
        if (error.code === 'EADDRINUSE' && remainingAttempts > 0) {
          console.warn(`Port ${port} is already in use. Trying port ${port + 1}...`);
          return tryListen(port + 1, remainingAttempts - 1);
        }

        reject(error);
      });
    };

    tryListen(Number(preferredPort), attempts);
  });

const startServer = async () => {
  await connectDB();
  await listenWithRetry(env.port);
};

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
