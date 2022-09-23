import type { OriginalShared, Shared, SharedObject } from './types';

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
  return `promise new Promise((resolveProxy, rejectProxy) => {
  let installed = false;
  let shareScope;
  
  if (window["${remoteEntriesGlobalKey}"]) {
    const proxy = {
      get(request) {
        return installed
          ? window["${containersGlobalKey}"]["${serviceName}"].get(request)
          : new Promise((resolveRequest, rejectRequest) => {
              const scriptElement = document.createElement("script");

              scriptElement.onload = () => {
                scriptElement.remove();
                const container = window["${containersGlobalKey}"]["${serviceName}"];
                try {
                  container.init(shareScope);
                  installed = true;
                } catch (e) {}
                resolveRequest(container.get(request));
              };
              
              scriptElement.onerror = () => {
                scriptElement.remove();
                rejectRequest(
                  new Error('Failed loading remoteEntry for "${serviceName}".')
                );
              };
              
              scriptElement.src = ${
                remoteEntryPath
                  ? `'${remoteEntryPath}'`
                  : `window['${remoteEntriesGlobalKey}']['${serviceName}']`
              };
              
              scriptElement.async = true;
              document.head.append(scriptElement);
            });
      },
      init(scope) {
        shareScope = scope;
      },
    };

    resolveProxy(proxy);
  } else {
    rejectProxy(
      new ReferenceError('Object "${remoteEntriesGlobalKey}" unavailable.')
    );
  }
});`;
}

/**
 * Объединяет две коллекции модулей, переопределяя в base совпадающие.
 * @param base Базовая коллекция модулей.
 * @param expanding Дополнительная коллекция модулей.
 * @return Объект модулей.
 */
export function mergeModules(base: Shared, expanding: Shared): OriginalShared {
  const merged = { ...toObject(base), ...toObject(expanding) };

  return Object.fromEntries(
    Object.entries(merged).filter(
      (pair): pair is [string, Exclude<typeof pair[1], false>] => pair[1] !== false,
    ),
  );
}

/**
 * Преобразует переданную коллекцию в объект.
 * @param shared Коллекция модулей.
 * @return Объект модулей.
 */
function toObject(shared: Shared): SharedObject {
  return wrapInArray(shared).reduce((result: SharedObject, item) => {
    if (typeof item === 'string') {
      result[item] = {}; // Валидное определение модуля (все значения из дефолтов).
      return result;
    } else {
      return { ...result, ...item };
    }
  }, {});
}

/**
 * Оборачивает элемент в массив, если он не является массивом.
 * @param original Элемент.
 * @return Массив.
 */
function wrapInArray<T>(original: T | T[]): T[] {
  return Array.isArray(original) ? original : [original];
}
