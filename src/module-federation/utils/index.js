/**
 * Возвращает скрипт инициализации удаленного модуля.
 * @param {string} serviceName Имя сервиса, содержащего удаленные модули.
 * @param {string} remoteEntriesGlobalKey Глобальная переменная, в которой хранятся пути к удаленным точкам входа.
 * @param {string} containersGlobalKey Глобальная переменная, в которую добавляются удаленные контейнеры.
 * @return {string} Скрипт инициализации.
 */
const createExternalConfig = (
  serviceName,
  remoteEntriesGlobalKey,
  containersGlobalKey
) =>
    `promise new Promise(resolve => {
  if (window['${remoteEntriesGlobalKey}']) {
    const scriptElement = document.createElement('script');
    scriptElement.onload = () => {
      scriptElement.remove();
      resolve(window['${containersGlobalKey}']['${serviceName}']);
    };
    scriptElement.src = window['${remoteEntriesGlobalKey}']['${serviceName}'];
    scriptElement.async = true;
    document.head.append(scriptElement);
  }
})`;

module.exports = { createExternalConfig };
