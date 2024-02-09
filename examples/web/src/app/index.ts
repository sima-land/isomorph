import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { sauce } from '@sima-land/isomorph/utils/axios';
import { FetchUtil } from '@sima-land/isomorph/http';
import { PresetWeb } from '@sima-land/isomorph/preset/web';
import { Api, Config, UserData } from '../types';
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
  const source = resolve(TOKEN.Lib.Config.source);
  const base = resolve(TOKEN.Lib.Config.base);

  return {
    ...base,
    devtoolsEnabled: source.require('PUBLIC_DEVTOOLS_ENABLED') !== '0',
  };
}

export function provideApi(resolve: Resolve): Api {
  const knownHosts = resolve(TOKEN.Lib.Http.Api.knownHosts);
  const createAxios = resolve(TOKEN.Lib.Axios.factory);
  const fetch = resolve(TOKEN.Lib.Http.fetch);

  const baseURL = new Request(knownHosts.get('simaV3')).url;

  return {
    getCurrencies() {
      // можем использовать axios из DI
      const axios = sauce(createAxios({ baseURL }));
      return axios.get('currency/');
    },
    getUser() {
      // а можем использовать fetch из DI
      return fetch(new URL('user/', baseURL)).then(
        ...FetchUtil.eitherResponse<{ items: UserData[] }>(),
      );
    },
  };
}
