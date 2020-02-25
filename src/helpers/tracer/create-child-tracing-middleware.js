import { createObserveMiddleware } from '../../observe-middleware';
import isString from 'lodash/isString';

/**
 * Возвращает функцию, создающую middleware для добавления в трэйсер длительности внутреннего процесса
 * при обработке запроса.
 * @param {Object} dependencies Опции.
 * @param {string} dependencies.spanName Имя span'а.
 * @param {Object} dependencies.tracer Экземпляр трэйсера.
 * @param {Function} dependencies.startSubscriber Подписчик на событие начала рендеринга.
 * @param {Function} dependencies.finishSubscriber Подписчик на событие конца рендеринга.
 * @param {string} [dependencies.parentSpan='span'] Иимя родительского спана в response.locals.
 * @return {Function} Middleware приложения Express.
 */
export const createChildTracingMiddleware = ({
  spanName,
  tracer,
  startSubscriber,
  finishSubscriber,
  parentSpan = 'span',
}) => {
  if (!isString(spanName)) {
    throw new TypeError('"spanName" properties must be a string');
  }
  return createObserveMiddleware({
    onStart: (timestamp, request, response) => {
      response.locals[spanName] = tracer.startSpan(
        spanName,
        {
          childOf: response.locals[parentSpan],
        }
      );
    },
    onFinish: (duration, request, response) => {
      response.locals[spanName]
        .setTag(`${spanName} duration`, `${duration} ms`)
        .finish();
    },
    startSubscriber,
    finishSubscriber,
  });
};
