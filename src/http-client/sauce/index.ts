import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { safetyAsync, SafetyInfo } from '../../utils/function';
import type { AxiosInstanceWrapper, MethodName } from 'middleware-axios';

// @todo передавать заголовки ответа
export type SauceResponse<T = any> =
  | {
      ok: true;
      status: number;
      data: T;
    }
  | {
      ok: false;
      status?: unknown; // unknown так как не факт что упали именно по статусу, например может быть exception
      data?: unknown; // иногда хочется узнать, что прислал сервер вместе с ошибкой (например 422)
      error: any;
    };

export interface SauceMethod<K extends MethodName | 'request'> {
  <T>(...args: Parameters<(AxiosInstance | AxiosInstanceWrapper)[K]>): Promise<SauceResponse<T>>;
}

/**
 * Обёртка над экземпляр axios.
 * Все методы возвращают promise, который никогда переходят в состояние rejected.
 */
export interface Sauce {
  readonly request: SauceMethod<'request'>;
  readonly get: SauceMethod<'get'>;
  readonly delete: SauceMethod<'delete'>;
  readonly head: SauceMethod<'head'>;
  readonly options: SauceMethod<'options'>;
  readonly post: SauceMethod<'post'>;
  readonly put: SauceMethod<'put'>;
  readonly patch: SauceMethod<'patch'>;
}

/**
 * Оборачивает экземпляр axios. Все методы обертки возвращают promise, которые никогда не попадают в состояние rejected.
 * @param instance Экземпляр axios или AxiosInstanceWrapper.
 * @return Обертка.
 */
export function sauce(instance: AxiosInstance | AxiosInstanceWrapper): Sauce {
  return {
    request: safetyAsync(instance.request, formatResultInfo),
    get: safetyAsync(instance.get, formatResultInfo),
    delete: safetyAsync(instance.delete, formatResultInfo),
    head: safetyAsync(instance.head, formatResultInfo),
    options: safetyAsync(instance.options, formatResultInfo),
    post: safetyAsync(instance.post, formatResultInfo),
    put: safetyAsync(instance.put, formatResultInfo),
    patch: safetyAsync(instance.patch, formatResultInfo),
  };
}

/**
 * Функция форматирования результата, используемая в sauce.
 * @param info Результат вызова метода экземпляра axios.
 * @return Отформатированный ответ.
 */
export function formatResultInfo(info: SafetyInfo<AxiosResponse>): SauceResponse {
  if (info.ok) {
    return {
      ok: true,
      data: info.result.data,
      status: info.result.status,
    };
  } else {
    return {
      ok: false,
      data: axios.isAxiosError(info.error) ? info.error.response?.data : undefined,
      status: axios.isAxiosError(info.error) ? info.error.response?.status : undefined,
      error: info.error,
    };
  }
}
