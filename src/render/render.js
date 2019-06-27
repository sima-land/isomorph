import isFunction from 'lodash/isFunction';

/**
 * Возвращает шаблон, который подходит текущей конфигурации
 * @param {Object} data Данные
 * @property {Object} data.templates Шаблоны
 * @property {Object} data.config Конфигурация со средой выполнения
 * @return {Object} Шаблон совпадающий со средой выполнения
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
 * Проверка templates на валидность
 * @param {Object} templateObject Шаблон
 * @return {Object} [templateObject] Валидный шаблон
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
 * Преобразует функцию в строку
 * @param {string} key Ключ объекта
 * @param {*} value Значение объекта
 * @return {*} [value] Приобразованное значение объекта
 */
export function jsonStringifyReplacer (key, value) {
  if (!JSON.stringify(value)) {
    value = Object.prototype.toString.call(value);
  }
  return value;
}
