module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  setupFiles: ['./.jest/setup.js'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.jest.json',
      babelConfig: require('./babel.config'),
    },
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(middleware-axios))/',
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
