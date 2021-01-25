const { ModuleFederationPlugin } = require('webpack').container;
const { createExternalConfig } = require('./utils');

/** @typedef {string} Remote Имя удаленного сервиса (обычно совпадает с именем в git). */
/** @typedef {import('webpack').ModuleFederationPluginOptions} MFPluginOriginalOptions */

/**
 * @typedef EnhancedModuleFederationPluginOptions
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
    this._options = options;
  }

  /**
   * @param {import('webpack').Compiler} compiler Компилятор.
   */
  apply (compiler) {
    const {
      name,
      remotes,
      remoteEntriesGlobalKey = '__RemoteEntriesList__',
      containersGlobalKey = '__FederationContainers__',
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
          name,
          library: {
            type: 'global',
            name: [containersGlobalKey, name],
          },
          ...remotes && { remotes: configuredRemotes },
          ...originalOptions,
        }).apply(compiler);
      }
    });
  }
}

module.exports = EnhancedModuleFederationPlugin;
