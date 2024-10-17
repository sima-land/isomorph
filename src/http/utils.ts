import type { URLSearchParamsInit, ResponseDone, ResponseFail } from './types';

/**
 * Утилиты для работы с URL, URLSearchParams, Headers, Request, Response.
 */
export const FetchUtil = {
  /**
   * Получив параметры применит их к переданному URL.
   * @param url URL.
   * @param params Параметры.
   */
  setParams(url: URL, params: URLSearchParamsInit): void {
    for (const [paramName, paramValue] of Object.entries(params)) {
      if (paramValue === null) {
        url.searchParams.delete(paramName);
        continue;
      }

      if (paramValue !== undefined) {
        url.searchParams.set(paramName, String(paramValue));
        continue;
      }
    }
  },

  // @todo resetPrams?

  /**
   * Получив URL и параметры вернет новый URL с примененными параметрами.
   * @param url URL.
   * @param params Параметры.
   * @return URL.
   */
  withParams(url: string | URL, params: URLSearchParamsInit): URL {
    const resultUrl = new URL(url);

    FetchUtil.setParams(resultUrl, params);

    return resultUrl;
  },

  /**
   * Получив URL вернет его копию но без параметров.
   * @param url URL.
   * @return URL.
   */
  withoutParams(url: string | URL): URL {
    const resultUrl = new URL(url);

    resultUrl.search = '';

    return resultUrl;
  },

  /**
   * Возвращает кортеж обработчиков для Promise из fetch.
   * Полученный Promise никогда не уйдет в состояние rejected.
   * @param options Опции.
   * @return Кортеж.
   */
  eitherResponse<T = unknown>({
    parseBody = response => response.json(),
  }: {
    /** Парсер body. */
    parseBody?: (response: Response) => Promise<T>;
  } = {}) {
    /** @inheritdoc */
    const parse = async (response: Response): Promise<T | null> => {
      try {
        return await parseBody(response);
      } catch {
        return null;
      }
    };

    return [
      // then
      async (response: Response): Promise<ResponseDone<T> | ResponseFail<T>> => {
        if (!response.ok) {
          return {
            ok: false,
            data: (await parse(response)) as T,
            error: new Error(`Request failed with status code ${response.status}`),
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          };
        }

        return {
          ok: true,
          data: (await parse(response)) as T,
          error: null,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      },

      // catch
      async (error: unknown): Promise<ResponseFail<T>> => ({
        ok: false,
        error,
      }),
    ] as const;
  },
} as const;

/**
 * Проверяет, является ли переданное значение ошибкой.
 * @param value Значение.
 * @return Является ли значение ошибкой.
 */
function isError(value: unknown): value is Error {
  return Object.prototype.toString.call(value) === '[object Error]';
}

// Основано на исходном коде пакета https://github.com/sindresorhus/is-network-error
const networkErrorMessages = new Set([
  'network error', // Chrome
  'Failed to fetch', // Chrome
  'NetworkError when attempting to fetch resource.', // Firefox
  'The Internet connection appears to be offline.', // Safari 16
  'Load failed', // Safari 17+
  'Network request failed', // `cross-fetch`
  'fetch failed', // Undici (Node.js)
  'terminated', // Undici (Node.js)

  // дальше идут наши наработки (основано на данных из Sentry)
  'Network Error', // Safari 17.4
]);

/**
 * Проверяет, является ли переданное значение ошибкой сети.
 * Основано на исходном коде пакета https://github.com/sindresorhus/is-network-error.
 * Нет возможности использовать пакет is-network-error по причине того что он - ESM only.
 * @param value Проверяемое значение.
 * @return Является ли значение TypeError о том что произошла ошибка сети.
 */
export function isNetworkError(value: unknown): value is TypeError {
  const isValid = isError(value) && value.name === 'TypeError' && typeof value.message === 'string';

  if (!isValid) {
    return false;
  }

  // ВАЖНО: в Safari 17+ ошибки имеют определенное сообщение и не имеют свойства stack
  if (value.message === 'Load failed') {
    return value.stack === undefined;
  }

  return networkErrorMessages.has(value.message);
}

/**
 * Проверяет является ли переданное значение ошибкой обрывания с помощью AbortController.
 * @param value Проверяемое значение.
 * @return Является ли значение ошибкой обрывания.
 */
export function isAbortError(value: unknown): value is { name: 'AbortError' } {
  return typeof value === 'object' && value !== null && (value as any).name === 'AbortError';
}
