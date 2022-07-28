/**
 * Возвращает скрипт инициализации удаленного модуля.
 * @internal
 * @param params Параметры.
 * @param params.serviceName Имя сервиса, содержащего удаленные модули.
 * @param params.containersGlobalKey Глобальная переменная, в которую добавляются удаленные контейнеры.
 * @param params.remoteEntriesGlobalKey Глобальная переменная, в которой хранятся пути к удаленным точкам входа.
 * @param params.remoteEntryPath Путь к remoteEntry, если его не надо получать в runtime.
 * @return Скрипт инициализации.
 */
export function createExternalConfig({
  serviceName,
  containersGlobalKey,
  remoteEntriesGlobalKey,
  remoteEntryPath,
}: {
  serviceName: string;
  remoteEntriesGlobalKey: string;
  containersGlobalKey: string;
  remoteEntryPath?: string;
}) {
  return `promise new Promise((resolve, reject) => {
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
    scriptElement.src = ${
      remoteEntryPath
        ? `'${remoteEntryPath}'`
        : `window['${remoteEntriesGlobalKey}']['${serviceName}']`
    };
    scriptElement.async = true;
    document.head.append(scriptElement);
  } else {
    reject(new ReferenceError('Object "${remoteEntriesGlobalKey}" unavailable.'));
  }
})`;
}
