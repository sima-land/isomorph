const { ModuleFederationPlugin } = require('webpack').container;
const WebpackError = require('webpack').WebpackError;
const { createExternalConfig } = require('./utils');

const LIBRARY_ERROR_TEXT = [
  'Property "library" set internally as "global" and not overridden.',
  'For override global variable name use "containersGlobalKey" property.',
  'For override "library" type use ModuleFederationPlugin.',
].join(' ');

/** @typedef {string} Remote Имя удаленного сервиса (обычно совпадает с именем в git). */
/** @typedef {import('webpack').ModuleFederationPluginOptions} MFPluginOriginalOptions Опции. */

/**
 * @typedef EnhancedModuleFederationPluginOptions Опции.
 * @param {string} name Имя сервиса.
 * @param {string} filename Имя удаленной точки входа.
 * @param {Object<string, Remote>} [remotes] Удаленные сервисы.
 * @param {MFPluginOriginalOptions.exposes} [exposes] Предоставляемые сервисы.
 * @param {MFPluginOriginalOptions.shared} [shared] Общие зависимости.
 * @param {string} [remoteEntriesGlobalKey = '__RemoteEntriesList__'] Ключ свойства в глобальном объекте,
 * в котором хранится карта точек входа в удаленные сервисы.
 * @param {string} [containersGlobalKey = '__FederationContainers__'] Ключ свойства в глобальном объекте,
 * в который добавляются контейнеры удаленных сервисов.
 * @param {boolean} [useInDevelopment = false] Требуется ли подключение ModuleFederationPlugin в среде разработки.
 */

/**
 * Создает плагин ModuleFederation с опциями, необходимыми для оркестрации удаленных модулей на клиенте.
 * Плагин ModuleFederation будет добавлен в production режиме.
 */
class EnhancedModuleFederationPlugin {
  /**
   * @param {EnhancedModuleFederationPluginOptions} options Опции.
   */
  constructor (options) {
    const {
      name,
      library,
      remoteEntriesGlobalKey = '__RemoteEntriesList__',
      containersGlobalKey = '__FederationContainers__',
    } = options;

    if (library) {
      throw new WebpackError(LIBRARY_ERROR_TEXT);
    }

    this._options = {
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
   * @param {import('webpack').Compiler} compiler Компилятор.
   */
  apply (compiler) {
    const {
      remotes,
      remoteEntriesGlobalKey,
      containersGlobalKey,
      useInDevelopment = false,
      ...originalOptions
    } = this._options;

    const configuredRemotes = {};

    remotes && Object.keys(remotes).forEach(key => {
      configuredRemotes[key] = { external: createExternalConfig(
        remotes[key],
        remoteEntriesGlobalKey,
        containersGlobalKey
      ) };
    });

    compiler.hooks.environment.tap('EnhancedModuleFederationPlugin', () => {
      if (useInDevelopment || compiler.options.mode === 'production') {
        new ModuleFederationPlugin({
          ...remotes && { remotes: configuredRemotes },
          ...originalOptions,
        }).apply(compiler);
      }
    });
  }
}

module.exports = EnhancedModuleFederationPlugin;
