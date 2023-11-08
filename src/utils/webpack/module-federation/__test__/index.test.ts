import { container, Compiler } from 'webpack';
import { DEFAULT_SHARED, LIBRARY_ERROR_TEXT, ModuleFederationPlugin, REMOTE_ERROR_TEXT } from '..';

jest.mock('../utils', () => ({
  createExternalConfig: jest.fn(arg => arg),
}));

jest.mock('webpack', () => {
  class ModuleFederationPluginMock {
    static __spy__ = { constructor: jest.fn(), apply: jest.fn() };

    constructor(...args: any[]) {
      ModuleFederationPluginMock.__spy__.constructor(...args);
    }

    apply(...args: any[]) {
      ModuleFederationPluginMock.__spy__.apply(...args);
    }
  }

  return {
    container: {
      ModuleFederationPlugin: ModuleFederationPluginMock,
    },
    WebpackError: class extends Error {},
  };
});

function getSpy(value: any): { constructor: jest.Mock; apply: jest.Mock } {
  return value.__spy__;
}

beforeEach(() => {
  getSpy(container.ModuleFederationPlugin).constructor.mockClear();
  getSpy(container.ModuleFederationPlugin).apply.mockClear();
});

describe('ModuleFederationPlugin', () => {
  function createCompilerMock(): Compiler {
    return {
      hooks: {
        environment: {
          tap: jest.fn((name, cb) => cb()),
        },
      },
    } as any;
  }

  it('constructor should have specific name', () => {
    /**
     * Для того чтобы не подпадать под условие из @sentry/webpack-plugin.
     * @see {@link https://github.com/getsentry/sentry-webpack-plugin/blob/master/src/index.js#L110}
     */
    expect(ModuleFederationPlugin.name).not.toBe('ModuleFederationPlugin');
  });

  describe('ModuleFederationPlugin instance', () => {
    it('should apply original plugin', () => {
      const compiler = createCompilerMock();
      const instance = new ModuleFederationPlugin({ name: 'test-module' });

      expect(getSpy(container.ModuleFederationPlugin).apply).toHaveBeenCalledTimes(0);

      instance.apply(compiler);

      expect(getSpy(container.ModuleFederationPlugin).apply).toHaveBeenCalledTimes(1);
      expect(getSpy(container.ModuleFederationPlugin).apply).toHaveBeenCalledWith(compiler);
    });

    it('should not creat and throw error, if library property pass to plugin', () => {
      expect(() => {
        new ModuleFederationPlugin({ library: 'test' } as any);
      }).toThrow(LIBRARY_ERROR_TEXT);
    });

    it('should not creat and throw error, if remotes property incorrect', () => {
      expect(() => {
        new ModuleFederationPlugin({ remotes: { remoteOne: {} } } as any);
      }).toThrow(REMOTE_ERROR_TEXT);
    });
  });

  describe('ModuleFederationPlugin instance should create with correct arguments', () => {
    it('for remotes', () => {
      const compiler = createCompilerMock();
      const instance = new ModuleFederationPlugin({
        name: 'service-name',
        remotes: {
          firstRemote: 'first-remote-service',
          secondRemote: 'second-remote-service',
        },
      });

      instance.apply(compiler);

      expect(getSpy(container.ModuleFederationPlugin).constructor).toHaveBeenCalledWith({
        name: 'service-name',
        library: {
          type: 'global',
          name: ['__FederationContainers__', 'service-name'],
        },
        remotes: {
          firstRemote: {
            external: {
              serviceName: 'first-remote-service',
              remoteEntriesGlobalKey: '__RemoteEntriesList__',
              containersGlobalKey: '__FederationContainers__',
            },
          },
          secondRemote: {
            external: {
              serviceName: 'second-remote-service',
              remoteEntriesGlobalKey: '__RemoteEntriesList__',
              containersGlobalKey: '__FederationContainers__',
            },
          },
        },
      });
    });

    it('for remotes with custom global variables name', () => {
      const compiler = createCompilerMock();
      const instance = new ModuleFederationPlugin({
        name: 'service-name',
        remotes: {
          firstRemote: 'first-remote-service',
          secondRemote: 'second-remote-service',
        },
        remoteEntriesGlobalKey: 'remotes-entry-key',
        containersGlobalKey: 'containers-key',
      });

      instance.apply(compiler);
      expect(getSpy(container.ModuleFederationPlugin).constructor).toHaveBeenCalledWith({
        name: 'service-name',
        library: {
          type: 'global',
          name: ['containers-key', 'service-name'],
        },
        remotes: {
          firstRemote: {
            external: {
              serviceName: 'first-remote-service',
              remoteEntriesGlobalKey: 'remotes-entry-key',
              containersGlobalKey: 'containers-key',
            },
          },
          secondRemote: {
            external: {
              serviceName: 'second-remote-service',
              remoteEntriesGlobalKey: 'remotes-entry-key',
              containersGlobalKey: 'containers-key',
            },
          },
        },
      });
    });

    it('for various remote type', () => {
      const compiler = createCompilerMock();

      const instance = new ModuleFederationPlugin({
        name: 'service-name',
        remotes: {
          firstRemote: 'first-remote-service',
          secondRemote: {
            name: 'second-remote-service',
          },
          thirdRemote: {
            name: 'third-remote-service',
            remoteEntryPath: '//example.com/path/to/RemoteEntry.js',
          },
        },
      });

      instance.apply(compiler);
      expect(getSpy(container.ModuleFederationPlugin).constructor).toHaveBeenCalledWith({
        name: 'service-name',
        library: {
          type: 'global',
          name: ['__FederationContainers__', 'service-name'],
        },
        remotes: {
          firstRemote: {
            external: {
              serviceName: 'first-remote-service',
              remoteEntriesGlobalKey: '__RemoteEntriesList__',
              containersGlobalKey: '__FederationContainers__',
            },
          },
          secondRemote: {
            external: {
              serviceName: 'second-remote-service',
              remoteEntriesGlobalKey: '__RemoteEntriesList__',
              containersGlobalKey: '__FederationContainers__',
            },
          },
          thirdRemote: {
            external: {
              serviceName: 'third-remote-service',
              remoteEntriesGlobalKey: '__RemoteEntriesList__',
              containersGlobalKey: '__FederationContainers__',
              remoteEntryPath: '//example.com/path/to/RemoteEntry.js',
            },
          },
        },
      });
    });

    it('for exposes', () => {
      const compiler = createCompilerMock();

      const instance = new ModuleFederationPlugin({
        name: 'service-name',
        filename: 'path/to/RemoteEntry.js',
        exposes: {
          './One': './path/to/one.js',
          './Two': './path/to/two.js',
        },
      });

      instance.apply(compiler);
      expect(getSpy(container.ModuleFederationPlugin).constructor).toHaveBeenCalledWith({
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

    it('for several call "apply" method', () => {
      const compiler = createCompilerMock();

      const instance = new ModuleFederationPlugin({
        name: 'service-name',
      });

      instance.apply(compiler);
      instance.apply(compiler);

      const calls = getSpy(container.ModuleFederationPlugin).constructor.mock.calls;

      for (const key of Object.keys(calls[0][0])) {
        expect(calls[1][0][key] === calls[0][0][key]).toBe(true);
      }
    });

    describe('for shared', () => {
      it('should pass default shared modules', () => {
        const compiler = createCompilerMock();

        const instance = new ModuleFederationPlugin({
          name: 'service-name',
        });

        instance.apply(compiler);
        expect(getSpy(container.ModuleFederationPlugin).constructor).toHaveBeenCalledWith({
          name: 'service-name',
          library: {
            type: 'global',
            name: ['__FederationContainers__', 'service-name'],
          },
          shared: DEFAULT_SHARED,
        });
      });

      it('should pass shared modules from options', () => {
        const compiler = createCompilerMock();

        const instance = new ModuleFederationPlugin({
          name: 'service-name',
          shared: { module: '^x.x.x' },
        });

        instance.apply(compiler);
        expect(getSpy(container.ModuleFederationPlugin).constructor).toHaveBeenCalledWith({
          name: 'service-name',
          library: {
            type: 'global',
            name: ['__FederationContainers__', 'service-name'],
          },
          shared: { module: '^x.x.x' },
        });
      });

      it('should disable default shared modules', () => {
        const compiler = createCompilerMock();

        const instance = new ModuleFederationPlugin({
          name: 'service-name',
          shared: false,
        });

        instance.apply(compiler);
        expect(getSpy(container.ModuleFederationPlugin).constructor).toHaveBeenCalledWith({
          name: 'service-name',
          library: {
            type: 'global',
            name: ['__FederationContainers__', 'service-name'],
          },
        });
      });
    });
  });
});
