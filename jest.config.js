module.exports = {
  transformIgnorePatterns: ['/node_modules/(?!(middleware-axios)).*/'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  transform: {
    '^.+\\.(jsx?)?$': 'babel-jest',
  },
  clearMocks: true,
  setupFiles: ['./jest.setup.js'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
