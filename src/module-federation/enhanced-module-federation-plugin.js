const { ModuleFederationPlugin } = require('webpack').container;
const WebpackError = require('webpack').WebpackError;
const { createExternalConfig } = require('./utils');

const LIBRARY_ERROR_TEXT = [
  'Property "library" set internally as "global" and not overridden.',
  'For override global variable name use "containersGlobalKey" property.',
  'For override "library" type use ModuleFederationPlugin.',
].join(' ');

const REMOTE_ERROR_TEXT = [
  'The value of the remote element must be a string,',
  'or an object with field `name` for dynamic resolution of `remoteEntry`.',
  'Set `remoteEntryPath` field to object for a static path to `remoteEntry`.',
].join(' ');

/** @typedef {string} RemoteName Имя удаленного сервиса (обычно совпадает с именем в git). */

/**
 * @typedef {Object} RemoteProperty Опции подключения удаленного сервиса.
 * @property {RemoteName} name Имя удаленного сервиса.
 * @property {string} remoteEntryPath Статический путь к remoteEntry удаленного сервиса.
 * @property {string} [version] Версия удаленного сервиса в формате semver.
 */

/** @typedef {import('webpack').ModuleFederationPluginOptions} MFPluginOriginalOptions Опции. */

/**
 * @typedef EnhancedModuleFederationPluginOptions Опции.
 * @param {string} name Имя сервиса.
 * @param {string} filename Имя удаленной точки входа.
 * @param {Object<string, RemoteName | RemoteProperty>} [remotes] Удаленные сервисы.
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
      remotes,
      remoteEntriesGlobalKey = '__RemoteEntriesList__',
      containersGlobalKey = '__FederationContainers__',
    } = options;

    if (library) {
      throw new WebpackError(LIBRARY_ERROR_TEXT);
    }

    if (remotes) {
      Object.values(remotes).forEach(value => {
        if (typeof value !== 'string' && !value?.name) {
          throw new WebpackError(REMOTE_ERROR_TEXT);
        }
      });
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

    remotes && Object.entries(remotes).forEach(([key, value]) => {
      const serviceName = value?.name || value;
      const remoteEntryPath = value?.remoteEntryPath;

      configuredRemotes[key] = { external: createExternalConfig({
        serviceName,
        remoteEntryPath,
        remoteEntriesGlobalKey,
        containersGlobalKey,
      }) };
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
