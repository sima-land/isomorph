/**
 * Формирует данные метрики из данных приложения, запроса и ответа.
 * @param {Object} options Опции приложения.
 * @param {Object} options.dependencies Зависимости сервиса сбора метрик.
 * @param {Object} options.dependencies.config Конфигурация приложения.
 * @param {import('http').IncomingMessage} options.request Запрос.
 * @param {import('http').ServerResponse} options.response Ответ.
 * @return {{route: string, place: string, statusCode: number}} Данные для отправки в метрику.
 */
export const labelsResolver = ({ dependencies: { config }, request, response }) => ({
  version: config.version || 'development',
  route: request.baseUrl + request.path,
  code: response.statusCode,
  method: request.method,
});

/**
 * Создаёт функцию, подписывающую обработчик на определённое событие ответа сервера.
 * @param {string} eventName Название события.
 * @return {function({response: import('http').ServerResponse, callback: Function}): import('http').ServerResponse}
 * Функция-подписчик.
 */
export const createResponseEventSubscriber = eventName =>
  ({ response, callback }) => response.once(eventName, callback);

/**
 * Подписывает функцию-обработчик на событие начала рендеринга.
 * @param {import('http').ServerResponse} response Ответ.
 * @param {Function} callback Обработчик.
 * @return {import('http').ServerResponse} Ответ.
 */
export const renderStartSubscriber = createResponseEventSubscriber('render:start');

/**
 * Подписывает функцию-обработчик на событие конца рендеринга.
 * @param {import('http').ServerResponse} response Ответ.
 * @param {Function} callback Обработчик.
 * @return {import('http').ServerResponse} Ответ.
 */
export const renderFinishSubscriber = createResponseEventSubscriber('render:finish');
