import jsesc from 'jsesc';

/**
 * Данные для SSR, сформированные на сервере.
 */
export interface BridgeServerSide {
  rootElementId: string;
  serverDataKey: string;
}

/**
 * Данные для SSR, доступные на стороне клиента (в браузере).
 */
export interface BridgeClientSide<T> {
  rootElement: HTMLElement;
  serverSideData: T;
}

/**
 * Набор методов для связывания серверного и клиентского приложений.
 */
export const SsrBridge = {
  /**
   * Вызывается на сервере.
   * @param serviceKey Идентификатор корневого элемента.
   * @return Идентификатор корневого элемента и ключ для глобальной переменной.
   */
  prepare(serviceKey: string): BridgeServerSide {
    return {
      rootElementId: `${serviceKey}__root`,
      serverDataKey: `${serviceKey}__serverData`,
    };
  },

  /**
   * Вызывается на клиенте.
   * @param serviceKey Идентификатор корневого элемента.
   * @return Корневой элемент и начальное состояние.
   */
  resolve<T = any>(serviceKey: string): BridgeClientSide<T> {
    const rootElement = document.getElementById(`${serviceKey}__root`);
    const serverSideData = (window as any)[`${serviceKey}__serverData`];

    if (!rootElement) {
      throw Error('SSR: Не был найден корневой элемент');
    }

    return { rootElement, serverSideData };
  },
} as const;

/**
 * Скрипт, формирующий глобально доступные на странице данные.
 * @param props Свойства.
 * @return Элемент.
 */
export function GlobalDataScript({
  property,
  value,
}: {
  property: string;
  value: Record<any, any>;
}) {
  const json = jsesc(JSON.stringify(value), {
    json: true,
    isScriptContext: true,
  });

  return (
    <script
      dangerouslySetInnerHTML={{
        // @todo возможно стоит также экранировать символы в "property"
        __html: `window["${property}"] = JSON.parse(${json});`,
      }}
    />
  );
}
