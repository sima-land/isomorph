const EnhancedMFPlugin = require('../enhanced-module-federation-plugin');
const { moduleFederationMock } = require('../../../__mocks__/webpack');

jest.mock('../utils', () => ({
  createExternalConfig: jest.fn(Array.of),
}));

beforeEach(() => {
  moduleFederationMock.constructorImplementation.mockClear();
  moduleFederationMock.applyImplementation.mockClear();
});

describe('EnhancedModuleFederationPlugin', () => {
  const compilerHooks = {
    hooks: {
      environment: {
        tap: jest.fn((name, cb) => cb()),
      },
    },
  };

  describe('ModuleFederationPlugin instance', () => {
    it('should creat for production env', () => {
      const compiler = { ...compilerHooks, options: { mode: 'production' } };
      const instance = new EnhancedMFPlugin({});

      instance.apply(compiler);
      expect(moduleFederationMock.constructorImplementation).toBeCalled();
      expect(moduleFederationMock.applyImplementation).toBeCalledWith(compiler);
    });

    it('should creat if useInDevelopment options is true', () => {
      const compiler = { ...compilerHooks, options: { mode: 'development' } };
      const instance = new EnhancedMFPlugin({ useInDevelopment: true });

      instance.apply(compiler);
      expect(moduleFederationMock.constructorImplementation).toBeCalled();
      expect(moduleFederationMock.applyImplementation).toBeCalledWith(compiler);
    });

    it('shouldn`t creat for other case', () => {
      const compiler = { ...compilerHooks, options: { mode: 'development' } };
      const instance = new EnhancedMFPlugin({});

      instance.apply(compiler);
      expect(moduleFederationMock.constructorImplementation).not.toBeCalled();
      expect(moduleFederationMock.applyImplementation).not.toBeCalled();
    });
  });

  describe('ModuleFederationPlugin instance should create with correct arguments', () => {
    it('for remotes', () => {
      const compiler = { ...compilerHooks, options: { mode: 'production' } };
      const instance = new EnhancedMFPlugin({
        name: 'service-name',
        remotes: {
          firstRemote: 'first-remote-service',
          secondRemote: 'second-remote-service',
        },
      });

      instance.apply(compiler);
      expect(moduleFederationMock.constructorImplementation).toBeCalledWith({
        name: 'service-name',
        library: {
          type: 'global',
          name: ['__FederationContainers__', 'service-name'],
        },
        remotes: {
          firstRemote: {
            external: ['first-remote-service', '__RemoteEntriesList__', '__FederationContainers__'],
          },
          secondRemote: {
            external: ['second-remote-service', '__RemoteEntriesList__', '__FederationContainers__'],
          },
        },
      });
    });

    it('for remotes with custom global variables name', () => {
      const compiler = { ...compilerHooks, options: { mode: 'production' } };
      const instance = new EnhancedMFPlugin({
        name: 'service-name',
        remotes: {
          firstRemote: 'first-remote-service',
          secondRemote: 'second-remote-service',
        },
        remoteEntriesGlobalKey: 'remotes-entry-key',
        containersGlobalKey: 'containers-key',
      });

      instance.apply(compiler);
      expect(moduleFederationMock.constructorImplementation).toBeCalledWith({
        name: 'service-name',
        library: {
          type: 'global',
          name: ['containers-key', 'service-name'],
        },
        remotes: {
          firstRemote: {
            external: ['first-remote-service', 'remotes-entry-key', 'containers-key'],
          },
          secondRemote: {
            external: ['second-remote-service', 'remotes-entry-key', 'containers-key'],
          },
        },
      });
    });

    it('for exposes', () => {
      const compiler = { ...compilerHooks, options: { mode: 'production' } };
      const instance = new EnhancedMFPlugin({
        name: 'service-name',
        filename: 'path/to/RemoteEntry.js',
        exposes: {
          './One': './path/to/one.js',
          './Two': './path/to/two.js',
        },
      });

      instance.apply(compiler);
      expect(moduleFederationMock.constructorImplementation).toBeCalledWith({
        name: 'service-name',
        filename: 'path/to/RemoteEntry.js',
        library: {
          type: 'global',
          name: ['__FederationContainers__', 'service-name'],
        },
        exposes: {
          './One': './path/to/one.js',
          './Two': './path/to/two.js',
        },
      });
    });
  });
});
