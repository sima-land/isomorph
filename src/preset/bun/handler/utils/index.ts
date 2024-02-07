/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { Handler } from '../../../../http';
import { KnownToken } from '../../../../tokens';
import { CURRENT_APP, type Application, type Resolve } from '../../../../di';

export function HandlerProvider(getApp: () => Application) {
  return (resolve: Resolve): Handler => {
    const parent = resolve(CURRENT_APP);

    return request => {
      const app = getApp();

      app.attach(parent);
      app.bind(KnownToken.Http.Handler.context).toValue({ request });

      return app.get(KnownToken.Http.Handler.main)(request);
    };
  };
}
