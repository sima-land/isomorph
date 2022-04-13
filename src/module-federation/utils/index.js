/**
 * Возвращает скрипт инициализации удаленного модуля.
 * @param {Object} params Параметры.
 * @param {string} params.serviceName Имя сервиса, содержащего удаленные модули.
 * @param {string} params.remoteEntriesGlobalKey Глобальная переменная,
 * в которой хранятся пути к удаленным точкам входа.
 * @param {string} params.containersGlobalKey Глобальная переменная, в которую добавляются удаленные контейнеры.
 * @param {string} params.remoteEntryPath Путь к remoteEntry, если его не надо получать в рантайме.
 * @return {string} Скрипт инициализации.
 */
const createExternalConfig = ({
  serviceName,
  remoteEntryPath,
  remoteEntriesGlobalKey,
  containersGlobalKey,
}) =>
    `promise new Promise((resolve, reject) => {
  if (window['${remoteEntriesGlobalKey}']) {
    const scriptElement = document.createElement('script');
    scriptElement.onload = () => {
      scriptElement.remove();
      resolve(window['${containersGlobalKey}']['${serviceName}']);
    };
    scriptElement.onerror = () => {
      scriptElement.remove();
      reject(new Error('Failed loading remoteEntry for "${serviceName}".'));
    };
    scriptElement.src = ${remoteEntryPath
        ? `'${remoteEntryPath}'`
        : `window['${remoteEntriesGlobalKey}']['${serviceName}']`
    };
    scriptElement.async = true;
    document.head.append(scriptElement);
  } else {
    reject(new ReferenceError('Object "${remoteEntriesGlobalKey}" unavailable.'));
  }
})`;

module.exports = { createExternalConfig };
