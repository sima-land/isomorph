import isObject from 'lodash/isObject';
import isFunction from 'lodash/isFunction';

/**
 * Определяет существует ли око.
 * @return {boolean} Да/нет.
 */
export const isOkoExists = () =>
  typeof window !== 'undefined' && isObject(window.oko) && isFunction(window.oko.push);

/**
 * Отправка аналитики в око.
 * @param {Object} meta Данные для отправки.
 */
export const sendAnalytics = ({ meta }) => {
  if (isOkoExists() && isObject(meta)) {
    window.oko.push(meta);
  }
};
