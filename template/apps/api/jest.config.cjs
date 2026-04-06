const { nestConfig } = require('../../packages/jest-config/dist/nest.js');

module.exports = {
  ...nestConfig,
  rootDir: '.',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^database/(.*)$': '<rootDir>/database/$1',
    '^lib/(.*)$': '<rootDir>/lib/$1',
    '^config/(.*)$': '<rootDir>/config/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
