import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { HttpStatus } from '../../isomorphic/utils/http-status';
import { logMiddleware } from '../../../utils/axios';

/**
 * Провайдер фабрики http-клиентов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Фабрика.
 */
export function provideAxiosMiddleware(resolve: Resolve) {
  const logHandler = resolve(KnownToken.Axios.Middleware.Log.handler);

  return [HttpStatus.axiosMiddleware(), logMiddleware(logHandler)];
}
