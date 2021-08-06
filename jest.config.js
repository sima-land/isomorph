module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/js-with-babel',
  setupFiles: ['./.jest/setup.js'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
      babelConfig: require('./babel.config'),
    },
  },
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  clearMocks: true,
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
};
