import isFunction from 'lodash/isFunction';
import getDependencies from './get-dependencies';
import isContainer from './is-container';

/**
 * Создаёт функцию для инъекции зависимостей из контейнера в функции.
 * @param {Function} getContainer Функция для получения экземпляра контейнера.
 * @return {Function} Функция для инъекции зависимостей из контейнера.
 */
const createInject = getContainer => ({
  target,
  dependencies = [],
  registerArgs,
}) => async (...args) => {
  const container = getContainer();

  // Если не получили контейнера, то выходим с ошибкой.
  if (!isContainer(container)) {
    throw new TypeError('Полученный результат выполнения функции getContainer не реализует интерфейс контейнера.');
  }

  // Если требуется регистрируем аргументы функции как сервисы в контейнере.
  if (isFunction(registerArgs)) {
    registerArgs(container, ...args);
  }
  return target(
    ...args,
    ...Object.values(await getDependencies(container, dependencies))
  );
};

export default createInject;
