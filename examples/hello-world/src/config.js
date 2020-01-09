import createConfig from '../../../src/config/create';
import useDotEnv from '../../../src/helpers/development/use-dot-env';
import validateConfig, {
  RULE_TYPES,
} from '../../../src/config/validate';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';

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

export default validateConfig(config, {
  serviceName: { type: RULE_TYPES.error },
  isDevelopment: { type: RULE_TYPES.error, validation: isBoolean },
  isProduction: { type: RULE_TYPES.error, validation: isBoolean },
  version: {
    type: RULE_TYPES.warning,
    validation: {
      validate: value => (isString(value) && value.length > 3) || isNumber,
      error: (property, value) => {
        throw Error(`Поле "${property}" в конфигурации приложения должно быть числом
        или строкой длинее трех символов. Текущее значение: ${value}`);
      },
    },
  },
});
