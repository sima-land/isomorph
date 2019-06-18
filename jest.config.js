module.exports = {
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  setupFiles: ['./jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
  },
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
