export const mockFactory = jest.fn(() => 3);
export const powFactory = jest.fn(({ num, power }) => num ** power);

/**
 * Тестовая функция.
 * @param {Object} param Параметры.
 * @param {Function} param.getValue Тестовая зависимость.
 * @param {*} param.initialValue Тестовая зависимость.
 * @return {*} Тестовый результат.
 */
export const factory = ({ getValue, initialValue }) => getValue(initialValue);
