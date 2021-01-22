/* eslint-disable require-jsdoc */
const applyImplementation = jest.fn();
const constructorImplementation = jest.fn();

class ModuleFederationPluginImplementation {
  constructor (options) {
    constructorImplementation(options);
  }
    apply = applyImplementation;
}

module.exports = {
  container: {
    ModuleFederationPlugin: ModuleFederationPluginImplementation,
  },
  moduleFederationMock: {
    applyImplementation,
    constructorImplementation,
  },
};
