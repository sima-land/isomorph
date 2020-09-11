import get from 'lodash/get';

/**
 * Получает из глобального объекта функцию для создания функции compose c devtools.
 * @return {Function | null} Функция для создания функции compose либо null, если функция не найдена.
 */
const getDevComposeCreator = () => get(window, '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__', null);

export default getDevComposeCreator;
