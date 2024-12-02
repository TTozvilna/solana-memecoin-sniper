const pino = require('pino');
const dotenv = require('dotenv');

dotenv.config();

const retrieveEnvVariable = (variableName, logger) => {
  const variable = process.env[variableName] || '';
  if (!variable) {
    logger.error(`${variableName} is not set`);
    process.exit(1);
  }
  return variable;
};

module.exports = { retrieveEnvVariable };
