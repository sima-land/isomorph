import type { SharedArray } from './types';

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
 * Перечень общих для всех сервисов зависимостей.
 */
export const DEFAULT_SHARED: SharedArray = [
  {
    react: {
      singleton: true,
    },
    'react-dom': {
      singleton: true,
    },
  },

  /* Инжектится транспайлером в [jt]sx для преобразования JSX */
  'react/jsx-runtime',
  'react-redux',
  '@reduxjs/toolkit',
  'redux-saga',

  /* Шарим модули, импортируемые из поддиректорий, например `/effects` */
  'redux-saga/',
  'classnames',
  /* Шарим модули, импортируемые из поддиректорий, например `/bind` */
  'classnames/',
  'axios',
  '@olime/cq-ch',
  '@sentry/browser',
];
