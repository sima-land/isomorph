/**
 * Фабрика для промежуточного слоя устанавливающего заголовки.
 * @param {Object} dependencies Объект зависимостей.
 * @param {Object} [dependencies.headers] Объект заголовков.
 * @return {Function} Промежуточный слой приложения для установки заголовков со ссылками на клиентские ресурсы.
 */
const createSetHeaderMiddleware = ({
  headers = {},
}) => (request, response, next) => {
  Object.entries(headers).forEach(([key, value]) => {
    response.set({ [key]: value });
  });

  next();
};

export default createSetHeaderMiddleware;
