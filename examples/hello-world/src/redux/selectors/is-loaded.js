import get from 'lodash/get';

/**
 * Выбирает значение флага, который отвечает за готовность стейта.
 * @param {Object} state Стейт.
 * @return {boolean} Возвращает значение флага.
 */
export default state => get(state, 'app.isLoaded', false);
