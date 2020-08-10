import propOr from 'lodash/fp/propOr';

const getDataLayer = propOr({}, ['app', 'dataLayer']);

/**
 * Возвращает функцию ответа на запрос, подходящую для текущего окружения.
 * @param {Object} dependencies Зависимости.
 * @param {boolean} dependencies.config.isProduction Флаг production среды.
 * @param {Object} dependencies.response Объект ответа.
 * @return {Function} Функция ответа на запрос.
 */
export default function createResponseSender ({ config: { isProduction }, response }) {
  /**
   * Функция ответа на запрос в формате HTML.
   * @param {Object} options Опции.
   * @param {string} options.markup Разметка.
   * @param {Object} options.headers Объект заголовков.
   */
  const htmlSender = ({
    markup,
    headers,
  }) => {
    Object.entries(headers).forEach(([key, value]) => {
      response.set({ [key]: value });
    });

    response.send(markup);
  };

  /**
   * Функция ответа на запрос в формате JSON.
   * @param {Object} options Опции.
   * @param {string} options.markup Разметка.
   * @param {{css: string, js: string}} options.assets Ссылки на ресурсы приложения.
   * @param {Object} options.store Стор приложения.
   */
  const jsonSender = ({
    markup,
    assets: {
      css,
      js,
    },
    store,
  }) => {
    const payload = {
      markup,
      bundle_css: css || '',
      bundle_js: js || '',
      meta: getDataLayer(store.getState()),
    };

    response.json(payload);
  };

  return isProduction ? jsonSender : htmlSender;
}
