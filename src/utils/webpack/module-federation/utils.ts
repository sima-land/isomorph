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
  if (window["${remoteEntriesGlobalKey}"]) {
    const proxy = {
      get(request) {
        return this.__installed
          ? window["${containersGlobalKey}"]["${serviceName}"].get(request)
          : new Promise((resolveRequest, rejectRequest) => {
              const scriptElement = document.createElement("script");

              scriptElement.onload = () => {
                scriptElement.remove();
                const container =
                  window["${containersGlobalKey}"]["${serviceName}"];
                try {
                  container.init(this.__shareScope);
                  this.__installed = true;
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
        this.__shareScope = scope;
      },
    };

    for (const method in proxy) {
      proxy[method] = proxy[method].bind(proxy);
    }

    resolveProxy(proxy);
  } else {
    rejectProxy(
      new ReferenceError('Object "${remoteEntriesGlobalKey}" unavailable.')
    );
  }
});`;
}
