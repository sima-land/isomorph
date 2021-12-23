module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./.jest/setup.js'],
  globalSetup: './.jest/global-setup.js',
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  clearMocks: true,
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
