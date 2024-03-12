import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { CreateAxiosDefaults } from 'axios';
import { create } from 'middleware-axios';

/**
 * Провайдер фабрики экземпляров AxiosInstanceWrapper.
 * @param resolve Функция для получения зависимости по токену.
 * @return Фабрика.
 */
export function provideAxiosFactory(resolve: Resolve) {
  const middleware = resolve(KnownToken.Axios.middleware);

  return (config: CreateAxiosDefaults = {}) => {
    const instance = create(config);

    for (const item of middleware) {
      instance.use(item);
    }

    return instance;
  };
}
