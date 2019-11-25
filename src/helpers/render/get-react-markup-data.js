import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';

/**
 * Возвращает функцию формирующую данные React-приложения.
 * @param {Object} param Параметры.
 * @param {ReactElement} param.app Главный компонент приложения.
 * @param {Object} param.store Объект глобального состояния приложения.
 * @param {string} param.key Ключ.
 * @return {Function} Функция формирующая данные React-приложения.
 */
const getReactMarkupData = ({ app: App, store, key = 'markup' }) => data => ({
  ...data,
  [key]: renderToString(<Provider store={store}><App /></Provider>),
});

export default getReactMarkupData;
