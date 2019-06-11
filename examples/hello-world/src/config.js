import createConfig from '../../../src/create-config';

const config = createConfig({
  isDevelopment: base => !base.NODE_ENV,
  isProduction: base => base.NODE_ENV === 'production',
  version: base => base.CI_COMMIT_REF_NAME || 'development',
  sentryDsnServer: null,
  sentryOptions: {},
  simalandApiURL: 'https://www.sima-land.ru',
  chponkiApiURL: 'https://chponki.sima-land.ru',
  proxy: [
    {
      url: '/api/*',
      header: 'Simaland-Service-Origin',
      map: {
        sima: ({ simalandApiURL }) => simalandApiURL,
        chponki: ({ chponkiApiURL }) => chponkiApiURL,
      },
    },
  ],
});

export default config;
