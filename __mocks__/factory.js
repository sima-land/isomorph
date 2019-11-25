export const mockFactory = jest.fn(() => 3);

/**
 * Тестовая функция.
 * @param {Object} param Параметры.
 * @param {Function} param.getValue Тестовая зависимость.
 * @param {*} param.initialValue Тестовая зависимость.
 * @return {*} Тестовый результат.
 */
export const factory = ({ getValue, initialValue }) => getValue(initialValue);
