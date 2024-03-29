module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['./.jest/setup.js'],
  globalSetup: './.jest/global-setup.js',
  transform: {
    '^.+\\.(t|j)sx?$': ['babel-jest', { configFile: './.jest/babel.config.js' }],
  },
  transformIgnorePatterns: ['/node_modules/'],
  clearMocks: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
