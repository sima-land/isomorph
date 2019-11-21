/**
 * Выводит данные в шаблон.
 * @param {Object} data Исхоные данные для рендеринга.
 * @param {Function} data.template Функция-шаблон, для вывода данных в разметку.
 * @param {Function} data.getAppData Функция формирующая настройки приложения.
 * @return {string} Разметка, в виде строки, полученная в результате рендеринга шаблона.
 */
const renderApp = ({
  template,
  getAppData,
}) => template({
  ...getAppData(),
});

export default renderApp;
