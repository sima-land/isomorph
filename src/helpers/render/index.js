import isFunction from 'lodash.isfunction';
import wrapInMeasureEvent from '../utils/wrap-in-measure-event';

/**
 * Создаёт функцию для рендеринга приложения, навешивая необходимые события.
 * @param {Object} param Параметры.
 * @param {Function} param.render Пользовательская функция для рендеринга приложения.
 * @param {import('http').ServerResponse} param.response Ответ.
 * @return {Function} Функция, обёрнутая в событие для измерения времени рендеринга.
 */
export const prepareRenderFunction = (
  {
    render,
    response,
  },
) => wrapInMeasureEvent(
  {
    fn: render,
    startEvent: 'render:start',
    endEvent: 'render:finish',
    emitter: response,
  }
);

/**
 * Возвращает шаблон, который подходит текущей конфигурации.
 * @param {Object} data Данные.
 * @property {Object} data.templates Шаблоны.
 * @property {Object} data.config Конфигурация со средой выполнения.
 * @return {Object} Шаблон совпадающий со средой выполнения.
 */
export const getTemplate = ({ templates, config } = {}) => {
  for (const templateName in templates) {
    const { checker, template } = validateTemplate(templates[templateName]);
    if (checker(config)) {
      return template;
    }
  }
};

/**
 * Проверка templates на валидность.
 * @param {Object} templateObject Шаблон.
 * @return {Object} [templateObject] Валидный шаблон.
 */
export function validateTemplate (templateObject) {
  const { checker, template } = templateObject || {};
  if ([checker, template].some(value => !isFunction(value))) {
    const jsonView = JSON.stringify(templateObject, jsonStringifyReplacer, 2);
    throw Error(`
Template object must contain properties "checker" and "template" that must be a functions.
${jsonView}
		`.trim());
  } else {
    return templateObject;
  }
}

/**
 * Преобразует функцию в строку.
 * @param {string} key Ключ объекта.
 * @param {*} value Значение объекта.
 * @return {*} [value] Преобразованное значение объекта.
 */
export function jsonStringifyReplacer (key, value) {
  let result = value;
  if (!JSON.stringify(value)) {
    result = Object.prototype.toString.call(value);
  }
  return result;
}
