import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { sauce } from '@sima-land/isomorph/utils/axios';
import { PresetWeb } from '@sima-land/isomorph/preset/web';
import { KnownToken } from '@sima-land/isomorph/tokens';
import { Api, Config } from '../types';
import { TOKEN } from '../tokens';

export function ExampleApp() {
  const app = createApplication();

  // используем пресет "web" с базовыми компонентами, такими как logger и тд
  app.preset(PresetWeb());

  // добавляем в приложение собственные компоненты
  app.bind(TOKEN.Project.config).toProvider(provideConfig);
  app.bind(TOKEN.Project.api).toProvider(provideApi);

  return app;
}

export function provideConfig(resolve: Resolve): Config {
  const source = resolve(KnownToken.Config.source);
  const base = resolve(KnownToken.Config.base);

  return {
    ...base,
    devtoolsEnabled: source.require('PUBLIC_DEVTOOLS_ENABLED') !== '0',
  };
}

export function provideApi(resolve: Resolve): Api {
  const knownHosts = resolve(KnownToken.Http.Api.knownHosts);
  const createClient = resolve(KnownToken.Http.Client.factory);
  const client = sauce(createClient({ baseURL: knownHosts.get('simaV3') }));

  return {
    getCurrencies() {
      return client.get('currency/');
    },
    getUser() {
      return client.get('user/');
    },
  };
}
