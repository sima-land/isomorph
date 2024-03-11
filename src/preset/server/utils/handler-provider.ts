import type { ServerHandler } from '../../server/types';
import { KnownToken } from '../../../tokens';
import { CURRENT_APP, type Application, type Resolve, Provider } from '../../../di';

/**
 * Получив фабрику DI-приложения вернёт провайдер обработчика.
 * После получения запроса фабрика будет вызвана.
 * Далее будет произведена попытка получить компонент обработчика.
 * @param getApp Фабрика DI-приложения.
 * @return Провайдер обработчика.
 */
export function HandlerProvider(getApp: () => Application): Provider<ServerHandler> {
  return (resolve: Resolve): ServerHandler => {
    const parent = resolve(CURRENT_APP);

    return (request, context) => {
      const app = getApp();

      app.attach(parent);
      app.bind(KnownToken.Http.Handler.context).toValue({ request, ...context });

      return app.get(KnownToken.Http.Handler.main)(request, context);
    };
  };
}
