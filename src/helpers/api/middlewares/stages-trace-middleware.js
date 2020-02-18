import EventEmitter from 'events';
import { REQUEST_STAGES } from '../server-adapter/constants';
import { FORMAT_HTTP_HEADERS } from 'opentracing';

/**
 * Класс, наследующий от EventEmitter.
 */
export class StageRequestEmitter extends EventEmitter {}

/**
 * Создаёт middleware для трассировки этапов запроса в API.
 * @param {Object} options Параметры для создания middleware.
 * @param {Object} options.tracer Объект трейсера.
 * @return {function(Object, Function): Promise} Middleware для трассироваки запросов в API.
 */
const createStagesTraceRequestMiddleware = ({ tracer }) =>

  /**
   * Middleware для трассировки этапов запроса в API.
   * @param {Object} requestConfig Параметры для создания middleware.
   * @param {Function} next Функция для получения данных.
   * @return {Promise} Promise.
   */
  async (requestConfig, next) => {
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, requestConfig.headers);
    const emitter = new StageRequestEmitter();

    let currentSpan;
    Object.values(REQUEST_STAGES).map(stage => emitter.on(stage, () => {
      currentSpan && currentSpan.finish();
      if (stage !== REQUEST_STAGES.end) {
        currentSpan = tracer.startSpan(stage.replace('start:', ''), { childOf: parentSpanContext });
      }
    }));
    requestConfig.emitter = emitter;

    await next(requestConfig);

    emitter.removeAllListeners();
  };

export default createStagesTraceRequestMiddleware;
