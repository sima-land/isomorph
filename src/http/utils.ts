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
    return [
      async (response: Response): Promise<ResponseDone<T> | ResponseFail<T>> => {
        if (!response.ok) {
          return {
            ok: false,
            data: (await parseBody(response).catch(() => null)) as T,
            error: new Error(`Request failed with status code ${response.status}`),
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          };
        }

        return {
          ok: true,
          data: (await parseBody(response).catch(() => null)) as T,
          error: null,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      },
      async (error: unknown): Promise<ResponseFail<T>> => ({
        ok: false,
        error,
      }),
    ] as const;
  },
} as const;
