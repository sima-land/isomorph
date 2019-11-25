import createProxyMiddleware from './create-proxy-middleware';

/**
 * Конструктор сервиса проксирования.
 * @param {Object} param Параметры.
 * @param {Object} param.config Конфигурация приложения.
 * @param {Object} param.config.proxy Конфигурация прокси.
 * @return {Function} Функция-конструктор.
 */
export default function createProxy (
  {
    config,
    config: {
      proxy,
    },
  }
) {
  return app => {
    if (!Array.isArray(proxy)) {
      throw TypeError('Параметр proxy должен быть массивом');
    }

    proxy.forEach(({ url, header, map, proxyOptions }) => {
      app.use(url, createProxyMiddleware(header, map, config, proxyOptions));
    });
  };
}
