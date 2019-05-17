module.exports = {
  setupFiles: ['./jestConfig.js'],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
};
