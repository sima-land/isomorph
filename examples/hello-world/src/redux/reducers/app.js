import { createReducer } from 'reduxsauce';
import { Types } from '../actions/app';

export const INITIAL_STATE = {
  settings: {},
  isLoaded: false,
  data: {},
};

/**
 * Сохранение настроек приложения в стейт.
 * @param {Object} state Стейт приложения.
 * @param {Object} page Настройки страницы.
 * @return {Object} Новый стейт.
 */
const setSettings = (state, { settings }) => ({
  ...state,
  settings,
});

/**
 * Установка флага о том, что все данные приложения загружены.
 * @param {Object} state Стейт приложения.
 * @return {Object} Обновлённый стейт.
 */
const setIsLoaded = state => ({
  ...state,
  isLoaded: true,
});

/**
 * Сохранение полученных данных.
 * @param {Object} state Стейт приложения.
 * @param {Object} action Экшн.
 * @param {Object} action.data Данные приложения.
 * @return {Object} Обновлённый стейт.
 */
const setCurrentData = (state, { data }) => ({
  ...state,
  data,
});

export const reducer = createReducer(INITIAL_STATE, {
  [Types.START_APP]: setSettings,
  [Types.FINISH_LOADING]: setIsLoaded,
  [Types.SET_CURRENT_DATA]: setCurrentData,
});
