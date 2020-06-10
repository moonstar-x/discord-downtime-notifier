const logger = require('@greencoast/logger');

const handleConnected = () => {
  logger.info('(MONGO): Connected to MongoDB.');
};

const handleConnecting = () => {
  logger.info('(MONGO): Connecting to MongoDB...');
};

const handleDisconnect = () => {
  logger.warn('(MONGO): Disconnected from MongoDB.');
};

const handleError = (error) => {
  logger.error('(MONGO): Connection Error!', error);
};

const handleReconnected = () => {
  logger.info('(MONGO): Reconnected to MongoDB.');
};

module.exports = {
  handleConnected,
  handleConnecting,
  handleDisconnect,
  handleError,
  handleReconnected
};
