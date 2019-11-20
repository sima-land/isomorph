import {
  createReducer as pureCreateReducer,
} from 'reduxsauce';
import { STATUSES } from './constants';
import pipe from 'lodash/fp/pipe';

/**
 * Приняв статус, вернет функцию,
 * которая примет состояние и добавит в него статус в поле "status".
 * @param {string} status Значение статуса.
 * @return {function (Object): Object} Примет состояние и добавит в него статус в поле "status".
 */
const defaultStatusAdderMaker = status => state => ({
  ...state,
  status,
});

/**
 * Возвращает новую функцию, которая вернет обернутый обработчик.
 * Обернутый обработчик добавит статус в состояние с помощью переданной функции withStatus.
 * @param {Function} withStatus Функция, добавляющая в состояние статус.
 * @return {function (Function): Function} Функция, оборачивающая обработчик.
 */
const createHandleWithStatusMaker = withStatus => {
  /**
   * Приняв обработчик, вернет функцию,
   * которая будет применять withStatus к результату обработчика.
   * @param {Function} handler Обработчик.
   * @return {*} Новое состояние.
   */
  const handlerMaker = handler => {
    const handleWithStatus = pipe(
      handler,
      withStatus
    );

    return handleWithStatus;
  };

  return handlerMaker;
};

/**
 * Модифицированная версия createReducer из пакета "reduxsauce".
 * @param {*} initialState Начальное состояние.
 * @param {function (Wrappers, Handlers): Object} createHandlers Должна вернуть набор обработчиков.
 * @param {Object} [options] Опции.
 * @param {Object} [options.createStatusAdder] Функция, которая добавит статус в состояние.
 * @return {Function} Функция-reducer.
 */
export const createReducer = (
  initialState,
  createHandlers,
  {
    createStatusAdder = defaultStatusAdderMaker,
  } = {}
) => {
  /**
   * @typedef {Object} Wrappers Набор оберток для обработчиков.
   * @property {Function} asInitial Обернет переданный обработчик, добавляя в состояние статус "initial".
   * @property {Function} asRequest Обернет переданный обработчик, добавляя в состояние статус "fetching".
   * @property {Function} asSuccess Обернет переданный обработчик, добавляя в состояние статус "success".
   * @property {Function} asFailure Обернет переданный обработчик, добавляя в состояние статус "failure".
   */
  const wrappers = {
    asInitial: createHandleWithStatusMaker(
      createStatusAdder(STATUSES.initial)
    ),
    asRequest: createHandleWithStatusMaker(
      createStatusAdder(STATUSES.fetching)
    ),
    asSuccess: createHandleWithStatusMaker(
      createStatusAdder(STATUSES.success)
    ),
    asFailure: createHandleWithStatusMaker(
      createStatusAdder(STATUSES.failure)
    ),
  };

  /**
   * @typedef {Object} Handlers Набор обработчиков.
   * @property {Function} initial Обработает состояние, добавив статус "initial" с помощью createStatusAdder.
   * @property {Function} request Обработает состояние, добавив статус "fetching" с помощью createStatusAdder.
   * @property {Function} success Обработает состояние, добавив статус "success" с помощью createStatusAdder.
   * @property {Function} failure Обработает состояние, добавив статус "failure" с помощью createStatusAdder.
   */
  const handlers = {
    initial: createStatusAdder(STATUSES.initial),
    request: createStatusAdder(STATUSES.fetching),
    success: createStatusAdder(STATUSES.success),
    failure: createStatusAdder(STATUSES.failure),
  };

  return pureCreateReducer(
    initialState,
    createHandlers(wrappers, handlers)
  );
};

/**
 * Возвращает функцию, создающую начальное состояние со статусом.
 * @param {*} baseInitialState Начальное состояние.
 * @param {Object} [options] Опции.
 * @param {Function} [options.createStatusAdder] Получив статус, вернет функцию, которая применит его к состоянию.
 * @return {Function} Функция, создающую начальное состояние со статусом.
 */
export const createStateMaker = (
  baseInitialState = {},
  {
    createStatusAdder = defaultStatusAdderMaker,
  } = {}
) => {
  const addStatus = createStatusAdder(STATUSES.initial);

  /**
   * Генерирует состояние с начальным статусом.
   * @return {*} Состояние с начальным статусом.
   */
  const createStateWithStatus = () => addStatus(
    baseInitialState
  );

  return createStateWithStatus;
};
