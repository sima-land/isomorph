/**
 * Валидация http статуса ответа на POST запрос.
 * @param {number} status Статус http ответа.
 * @return {boolean} Валидность.
 */
export const validatePostStatus = status => status === 201;

/**
 * Валидация http статуса ответа на DELETE запрос.
 * @param {number} status Статус http ответа.
 * @return {boolean} Валидность.
 */
export const validateDeleteStatus = status => status === 204 || status === 200;

/**
 * Валидация http статуса 200.
 * @param {number} status Статус http ответа.
 * @return {boolean} Валидность.
 */
export const isOkStatus = status => status === 200;
