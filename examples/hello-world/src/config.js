import createConfig from '../../../src/create-config';

const config = createConfig({
  isDevelopment: base => !base.NODE_ENV,
  isProduction: base => base.NODE_ENV === 'production',
  version: base => base.CI_COMMIT_REF_NAME || 'development',
  sentryDsnServer: null,
  sentryOptions: {},
});

export default config;
