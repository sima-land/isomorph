import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { SagaLogging } from '../utils/saga-logging';
import createSagaMiddleware, { SagaMiddleware } from 'redux-saga';

/**
 * Провайдер промежуточного слоя redux-saga для redux-хранилища.
 * @param resolve Функция для получения зависимости по токену.
 * @return Промежуточный слой для redux-хранилища.
 */
export function provideReduxMiddlewareSaga(resolve: Resolve): SagaMiddleware {
  const logger = resolve(KnownToken.logger);

  const logHandler = new SagaLogging(logger);

  return createSagaMiddleware({
    /** @inheritdoc */
    onError(error, errorInfo) {
      logHandler.onSagaError(error, errorInfo);
    },
  });
}
