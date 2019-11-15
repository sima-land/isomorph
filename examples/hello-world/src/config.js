import createConfig from '../../../src/create-config';
import useDotEnv from '../../../src/helpers/development/use-dot-env';

useDotEnv(process.env.NODE_ENV);

const config = createConfig({
  serviceName: 'Hello, world!',
  isDevelopment: base => base.NODE_ENV !== 'production',
  isProduction: base => base.NODE_ENV === 'production',
  version: base => base.CI_COMMIT_REF_NAME || 'development',
  sentryOptions: {},
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
  loadDataTimeout: 500,
});

export default config;
