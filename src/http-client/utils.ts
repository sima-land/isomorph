import { getServiceHeaders, getXClientIp } from '../http-server/utils';
import type { Request } from 'express';
import type { BaseConfig } from '../config/types';
import type { AxiosInstance } from 'axios';
import type { AxiosInstanceWrapper, MethodName } from 'middleware-axios';

// @todo передавать заголовки
export type SauceResponse<T = any> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: any;
    };

export interface SauceMethod<K extends MethodName> {
  <T>(...args: Parameters<AxiosInstanceWrapper[K]>): Promise<SauceResponse<T>>;
}

export interface Sauce {
  readonly get: SauceMethod<'get'>;
  readonly delete: SauceMethod<'delete'>;
  readonly head: SauceMethod<'head'>;
  readonly options: SauceMethod<'options'>;
  readonly post: SauceMethod<'post'>;
  readonly put: SauceMethod<'put'>;
  readonly patch: SauceMethod<'patch'>;
}

/**
 * Оборачивает экземпляр axios. Все методы обертки возвращают promise, который никогда не попадают в состояние rejected.
 * @param instance Экземпляр axios или AxiosInstanceWrapper.
 * @return Обертка.
 */
export function sauce(instance: AxiosInstance | AxiosInstanceWrapper): Sauce {
  // eslint-disable-next-line require-jsdoc, jsdoc/require-jsdoc
  function createMethod<Key extends MethodName>(methodName: Key) {
    return async function <Data = any>(
      ...args: Parameters<AxiosInstance[Key]>
    ): Promise<SauceResponse<Data>> {
      try {
        const response = await instance[methodName](...(args as [any]));
        return { ok: true, data: response.data };
      } catch (error) {
        return { ok: false, error };
      }
    };
  }

  return {
    get: createMethod('get'),
    delete: createMethod('delete'),
    head: createMethod('head'),
    options: createMethod('options'),
    post: createMethod('post'),
    put: createMethod('put'),
    patch: createMethod('patch'),
  };
}

/**
 * Формирует заголовки для исходящих запросов с сервера по соглашению.
 * @param config Конфиг.
 * @param request Входящий запрос.
 * @return Заголовки для исходящих запросов.
 */
export function getRequestHeaders(config: BaseConfig, request: Request): Record<string, string> {
  return {
    'X-Client-Ip': getXClientIp(request),
    'User-Agent': `simaland-${config.appName}/${config.appVersion}`,
    Cookie: request.get('cookie') || '',
    ...getServiceHeaders(request),
  };
}
