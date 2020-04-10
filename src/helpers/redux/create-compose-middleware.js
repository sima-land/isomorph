import { compose } from 'redux';
import isFunction from 'lodash/isFunction';

/**
 * Создаёт функцию для композиции нескольких промежуточных обработчиков для применения в сторе
 * и подключения redux devtools в среде разработки.
 * @param {Object} options Опции.
 * @param {Function} options.devToolsComposeCreator Функция для создания compose с redux dev tools.
 * @param {Function} options.getName Функция возвращающая название сервиса.
 * @param {Function} options.getDevToolsEnabled Функция опредяляющая нужно ли подключать dev tools.
 * @return {Function} Функция для объединения нескольких промежуточных обработчиков в сторе.
 */
const createComposeMiddleware = ({
  devToolsComposeCreator,
  getName,
  getDevToolsEnabled,
} = {}) =>
  isFunction(devToolsComposeCreator) && isFunction(getName) && isFunction(getDevToolsEnabled) && getDevToolsEnabled()
    ? devToolsComposeCreator({
      name: getName(),
    })
    : compose;

export default createComposeMiddleware;
