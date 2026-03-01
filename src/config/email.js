const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

try {
  transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Verify connection only in production
  if (process.env.NODE_ENV !== 'test') {
    transporter.verify((error) => {
      if (error) {
        logger.warn(`Email transporter verification failed: ${error.message}`);
      } else {
        logger.info('Email server is ready to send messages');
      }
    });
  }
} catch (error) {
  logger.error(`Error creating email transporter: ${error.message}`);
  // Create a mock transporter for testing
  transporter = {
    sendMail: async () => ({ messageId: 'test-message-id' }),
    verify: (callback) => callback && callback(null),
  };
}

module.exports = transporter;
