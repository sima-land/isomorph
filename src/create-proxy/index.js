import createProxyMiddleware from './create-proxy-middleware';

/**
 * Конструктор сервиса проксирования
 * @param {Object} config Конфигурация приложения
 * @param {Object} proxy Конфигурация прокси
 * @return {Function} Функция-конструктор
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

    proxy.forEach(({ url, header, map }) => {
      app.use(url, createProxyMiddleware(header, map, config));
    });
  };
}
