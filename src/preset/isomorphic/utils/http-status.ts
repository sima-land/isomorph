import type { AxiosRequestConfig } from 'axios';
import type { Middleware as AxiosMiddleware } from 'middleware-axios';

/** Работа с HTTP-статусами по соглашению. */
export abstract class HttpStatus {
  /**
   * Определяет, является ли переданный статус успешным.
   * @param status Статус.
   * @return Признак.
   */
  static isOk(status: unknown): boolean {
    return typeof status === 'number' && status === 200;
  }

  /**
   * Определяет, является ли переданный статус успешным POST.
   * @param status Статус.
   * @return Признак.
   */
  static isPostOk(status: unknown): boolean {
    return typeof status === 'number' && status === 201;
  }

  /**
   * Определяет, является ли переданный статус успешным DELETE.
   * @param status Статус.
   * @return Признак.
   */
  static isDeleteOk(status: unknown): boolean {
    return typeof status === 'number' && (status === 204 || status === 200);
  }

  /**
   * Возвращает новый промежуточный слой для валидации статуса HTTP-ответа.
   * Валидация применяется только если в конфиге запроса не указан validateStatus.
   * @return Промежуточный слой.
   */
  static axiosMiddleware(): AxiosMiddleware<unknown> {
    return async (config, next, defaults) => {
      if (config.validateStatus !== undefined || defaults.validateStatus !== undefined) {
        // если validateStatus указан явно то не применяем валидацию по умолчанию
        await next(config);
      } else {
        let validateStatus: AxiosRequestConfig['validateStatus'] = null;

        switch (config.method?.toLowerCase()) {
          case 'get':
          case 'put':
          case undefined:
            validateStatus = HttpStatus.isOk;
            break;
          case 'post':
            validateStatus = HttpStatus.isPostOk;
            break;
          case 'delete':
            validateStatus = HttpStatus.isDeleteOk;
            break;
        }

        await next({ ...config, validateStatus });
      }
    };
  }
}
