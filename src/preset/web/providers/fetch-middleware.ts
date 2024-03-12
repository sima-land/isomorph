import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { FetchLogging } from '../../isomorphic/utils/fetch-logging';
import { log } from '../../../http';

/**
 * Провайдер промежуточных слоев для fetch.
 * @param resolve Функция для получения зависимости по токену.
 * @return Фабрика.
 */
export function provideFetchMiddleware(resolve: Resolve) {
  const logger = resolve(KnownToken.logger);

  // ВАЖНО: если появятся еще промежуточные слои - не забыть разделить логирование на 2 части (ошибки и данные)
  return [log(new FetchLogging(logger))];
}
