import createConfig from '../../../src/create-config';

const config = createConfig({
  serviceName: 'Hello, world!',
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
  mainPort: 4000,
  metricsPort: 4001,
  loadDataTimeout: 500,
});

export default config;
