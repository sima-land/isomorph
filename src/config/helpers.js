import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import { RULE_TYPES } from './validate';

/**
 * Станадртный валидатор, проверяет на непустую строку.
 * @param {*} value Значение, которое нужно провалидировать.
 * @return {boolean} Валидно ли значение.
 */
export const defaultValidate = value => isString(value) && value.length > 0;

/**
 * Возвращает текст ошибки про умолчанию.
 * @param {string} property Свойство для которого получена ошибка.
 * @return {string} Текст ошибки.
 */
export const getDefaultError = property =>
  `Ошибка конфигрурации приложения: Поле "${property}" заполнено некорректно`;

/**
 * Возвращает текст ошибки для переданной строки ошибки.
 * @param {string} property Свойство для которого получена ошибка.
 * @param {string} error Текст ошибки.
 * @return {string} Полный текст ошибки.
 */
export const getStringError = (property, error) =>
  `Ошибка конфигурации. Поле "${property}": ${error}`;

/**
 * Выбрасывает ошибку.
 * @param {string} errorText Текст ошибки.
 */
export const throwError = errorText => {
  throw new Error(errorText);
};

/**
 * Выводит в лог ошибку.
 * @param {string} errorText Текст ошибки.
 */
export const consoleError = errorText => {
  // eslint-disable-next-line no-console
  console.error(errorText);
};

/**
 * Вызывает ошибку.
 * @param {Object} errorData Данные необходимые для вывода ошибки.
 * @param {string} errorData.property Проверяемое свойство конфига.
 * @param {*} errorData.value Проверяемое значение.
 * @param {Function|string} [errorData.error] Либо функция, вызвающая ошибку, либо текст ошибки.
 * @param {'error'|'warning'} errorData.type Тип валидации.
 */
export const callError = ({
  property,
  value,
  error,
  type,
}) => {
  if (isFunction(error)) {
    error(property, value);
  } else {
    const errorText = isString(error)
      ? getStringError(property, error)
      : getDefaultError(property);

    type === RULE_TYPES.error
      ? throwError(errorText)
      : consoleError(errorText);
  }
};
