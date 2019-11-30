import container from '../container';
import { wrapInContext } from '../../../../src/container';
import get from 'lodash/get';

/**
 * Обработчик роута, возвращающий 'Hello World' в ответ.
 * @param {import('http').IncomingMessage} request Запрос.
 * @param {import('http').ServerResponse} response Ответ.
 * @param {Function} next Функция для передачи контроля следующему обработчику.
 * @param {Function} render Функция для рендеринга контента.
 * @param {Object} data Подготовленный стейт приложения.
 */
export const handler = async (request, response, next, render, data = {}) => {
  response.send(await render(get(data, 'app.data', 'Something went wrong...')));
};

export default wrapInContext({
  container,
  fn: handler,
  dependencies: [
    {
      render: 'helloRouteRender',
    },
    {
      data: 'helloState',
    },
  ],
  argsToOptions: (request, response) => ({ request, response }),
});
