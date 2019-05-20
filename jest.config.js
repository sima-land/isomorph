module.exports = {
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  setupFiles: ['./jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
  },
  snapshotSerializers: ['enzyme-to-json/serializer'],
};
