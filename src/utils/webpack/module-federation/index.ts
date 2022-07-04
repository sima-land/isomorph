import type { ModuleFederationPluginOptions, ReadyOptions } from './types';
import { container, Compiler, WebpackError } from 'webpack';
import { createExternalConfig } from './utils';

export const LIBRARY_ERROR_TEXT = [
  'Property "library" set internally as "global" and not overridden.',
  'For override global variable name use "containersGlobalKey" property.',
  'For override "library" type use ModuleFederationPlugin.',
].join(' ');

export const REMOTE_ERROR_TEXT = [
  'The value of the remote element must be a string,',
  'or an object with field "name" for dynamic resolution of "remoteEntry".',
  'Set "remoteEntryPath" field to object for a static path to "remoteEntry".',
].join(' ');

/**
 * Создает плагин ModuleFederation с опциями, необходимыми для оркестрации удаленных модулей в браузере.
 */
class CustomModuleFederationPlugin {
  /**
   * Проверенные, готовые опции.
   */
  readonly readyOptions: ReadyOptions;

  /**
   * @param options Опции.
   */
  constructor(options: ModuleFederationPluginOptions) {
    const {
      name,
      remotes,
      remoteEntriesGlobalKey = '__RemoteEntriesList__',
      containersGlobalKey = '__FederationContainers__',
    } = options;

    if ('library' in options) {
      throw new WebpackError(LIBRARY_ERROR_TEXT);
    }

    if (remotes) {
      for (const value of Object.values(remotes)) {
        if (typeof value !== 'string' && !value.name) {
          throw new WebpackError(REMOTE_ERROR_TEXT);
        }
      }
    }

    this.readyOptions = {
      ...options,
      remoteEntriesGlobalKey,
      containersGlobalKey,
      library: {
        type: 'global',
        name: [containersGlobalKey, name],
      },
    };
  }

  /**
   * @param compiler Компилятор.
   */
  apply(compiler: Compiler) {
    const { remotes, remoteEntriesGlobalKey, containersGlobalKey, ...restOptions } =
      this.readyOptions;

    const configuredRemotes: Record<string, any> = {};

    if (remotes) {
      for (const [key, value] of Object.entries(remotes)) {
        const serviceName = typeof value === 'string' ? value : value.name;
        const remoteEntryPath = typeof value === 'string' ? undefined : value.remoteEntryPath;

        configuredRemotes[key] = {
          external: createExternalConfig({
            serviceName,
            remoteEntryPath,
            remoteEntriesGlobalKey,
            containersGlobalKey,
          }),
        };
      }
    }

    compiler.hooks.environment.tap('[isomorph]ModuleFederationPlugin', () => {
      new container.ModuleFederationPlugin({
        ...(remotes && { remotes: configuredRemotes }),
        ...restOptions,
      }).apply(compiler);
    });
  }
}

export { CustomModuleFederationPlugin as ModuleFederationPlugin };
