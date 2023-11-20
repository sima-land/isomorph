export type URLSearchParamsInit = Record<string, string | number | boolean | undefined | null>;

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
} as const;
