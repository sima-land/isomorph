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
    '^.+\\.(js)?$': 'babel-jest',
  },
  clearMocks: true,
};
