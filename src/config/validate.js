import {
  defaultValidate,
  callError,
} from './helpers';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';

export const RULE_TYPES = Object.freeze({
  error: 'error',
  warning: 'warning',
});

/**
 * Возвращает массив валидаторов.
 * @param {Object|Array|Function} validation Функция-валидатор, либо объект-валидатор,
 * либо массив объектов-валидаторов.
 * @return {Array} Массив валидаторов.
 */
export const getValidatorsList = validation => {
  let result = validation;

  if (isFunction(validation)) {
    result = [{ validate: validation }];
  } else if (isPlainObject(validation)) {
    result = [validation];
  }

  return result;
};

/**
 * Проверяет значение на корректность.
 * @param {Function} validate Функция-валидатор.
 * @param {*} value Значение.
 * @return {boolean} Валидно ли значение.
 */
export const checkValue = (validate, value) => isFunction(validate)
  ? !validate(value)
  : !defaultValidate(value);

/**
 * Валидирует значение свойства конфигурации.
 * @param {string} property Название свойства.
 * @param {*} value Значение, которое нужно провалидировать.
 * @param {Object} rules Правила валидации,.
 * @param {Object|Array|Function} rules.validation Функция-валидатор, либо объект-валидатор,
 * либо массив объектов-валидаторов.
 */
export const validateValue = (
  property,
  value,
  {
    validation = defaultValidate,
    ...restRules
  }
) => {
  const validatorsList = getValidatorsList(validation);
  const failedValidator = validatorsList.find(({ validate }) =>
    checkValue(validate, value));

  failedValidator && callError({
    property,
    value,
    ...restRules,
    ...failedValidator,
  });
};

/**
 * Валидирует определенное свойство конфигурации.
 * @param {Object} config Объект конфигурации.
 * @param {string} property Название свойства.
 * @param {Object} rules Объект с описанием правил валидидации свойство.
 */
export const validateProperty = (config, property, rules) => {
  const value = config[property];
  const rulesList = Array.isArray(rules) ? rules : [rules];

  if (value === undefined) {
    const { error, type } = rules;
    callError({ property, value, error, type });
  } else {
    rulesList.forEach(rule => {
      validateValue(property, value, rule);
    });
  }
};

/**
 * Валидирует конфигурацию.
 * @param {Object} config Конфигурация, которую нужно провалидировать.
 * @param {Object} validationConfig Конфигурация валидатора.
 * @return {Object} Конфигурация приложения.
 */
const validateConfig = (
  config,
  validationConfig
) => {
  if (!isPlainObject(config)) {
    throw new TypeError('Конфигурация приложения должна быть чистым объектом');
  }

  if (!isPlainObject(validationConfig)) {
    throw new TypeError('Конфигурация валидатора должна быть чистым объектом');
  }

  Object.entries(validationConfig).forEach(([property, rules]) => {
    validateProperty(config, property, rules);
  });

  return config;
};

export default validateConfig;
