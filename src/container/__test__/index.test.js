import create, { createFactory, createService, createSingleton } from '..';
import isContainer from '../is-container';

/**
 * Тестовая функция.
 * @param {Object} params Параметры функции.
 * @param {Function} params.getValue Тестовая зависимость.
 * @param {*} params.initialValue Тестовая зависимость.
 * @return {*} Тестовый результат.
 */
const factory = ({ getValue, initialValue }) => getValue(initialValue);

describe('function create', () => {
  it('creates container correctly', async () => {
    const container = create({
      services: [
        {
          name: 'string',
          value: 'singleton',
        },
        {
          name: 'singleton',
          singleton: ({ string }) => ({
            whatIs () {
              return `It is ${string}`;
            },
          }),
          dependencies: ['string'],
        },
        {
          name: 'factory',
          factory: ({ singleton } = {}) => ({
            whatIs () {
              return singleton.whatIs();
            },
          }),
          dependencies: ['singleton'],
        },
      ],
    });

    const firstSingleton = await container.get('singleton');
    const secondSingleton = await container.get('singleton');

    expect(await container.get('string')).toBe('singleton');
    expect((await container.get('singleton')).whatIs()).toBe('It is singleton');
    expect(firstSingleton === secondSingleton).toBeTruthy();
    expect((await container.get('factory')).whatIs()).toBe('It is singleton');
  });

  it('container method get works correctly when dependency is Object', async () => {
    const container = create({
      services: [
        { name: 'getValue', value: () => 1 },
        { name: 'getValueSecond', value: () => 2 },
        { name: 'factory', factory, dependencies: [{ getValue: 'getValueSecond' }] },
      ],
    });

    expect(await container.get('factory')).toBe(2);
  });

  it('method works correctly when "services" is incorrect in constructor', () => {
    expect(() => create({ services: 2 })).toThrowError();
  });

  it('works correctly when there are no arguments in constructor', () => {
    const container = create();

    expect(container.hasOwnProperty('set')).toBe(true);
    expect(container.hasOwnProperty('get')).toBe(true);
  });

  it('works correctly when "name" is incorrect in method "set"', () => {
    const container = create();

    expect(() => container.set()).toThrowError();
    expect(() => container.set({ name: '' })).toThrowError();
    expect(() => container.set({ name: 1 })).toThrowError();
  });

  it('works correctly when "factory" is incorrect in method "set"', () => {
    const container = create();

    expect(() => container.set({ name: 'test', factory: 1 })).toThrowError();
  });

  it('works correctly when "singleton" is incorrect in method "set"', () => {
    const container = create();

    expect(() => container.set({ name: 'test', singleton: 1 })).toThrowError();
  });

  it('works correctly when "name" is incorrect in method "get"', async () => {
    const container = create();

    await expect(container.get()).rejects.toThrowError();
    await expect(container.get('')).rejects.toThrowError();
    await expect(container.get(1)).rejects.toThrowError();
  });

  it('works correctly when service registered incorrect', () => {
    const container = create();

    expect(() => container.set({ name: 'test' })).toThrowError();
  });

  it('search dependencies in parent container if parent passed', async () => {
    const parent = create({
      services: [{
        name: 'test',
        value: 5,
      }],
    });
    const container = create({
      services: [
        {
          name: 'squaredTest',
          factory: ({ test }) => test * test,
          dependencies: ['test'],
        },
      ],
      parent,
    });
    expect(await container.get('test')).toBe(5);
    expect(await container.get('squaredTest')).toBe(25);
    expect(container.get('')).rejects.toThrow(Error);
  });
  it('can override dependencies defined in parent container', async () => {
    const parent = create({
      services: [{
        name: 'test',
        value: 5,
      }],
    });
    const container = create({
      services: [
        {
          name: 'squaredTest',
          factory: ({ test }) => test * test,
          dependencies: ['test'],
        },
      ],
      parent,
    });
    expect(await container.get('test')).toBe(5);
    expect(await container.get('squaredTest')).toBe(25);
    container.set({ name: 'test', value: 6 });
    expect(await container.get('test')).toBe(6);
    expect(await container.get('squaredTest')).toBe(36);
  });

  it('works correctly when errors in child container', async () => {
    const container = create({
      services: [
        {
          name: 'singleton',
          singleton: ({ string }) => ({
            whatIs () {
              return `It is ${string}`;
            },
          }),
          dependencies: ['string'],
        },
        {
          name: 'factory',
          factory: ({ singleton } = {}) => ({
            whatIs () {
              return singleton.whatIs();
            },
          }),
          dependencies: ['singleton'],
        },
      ],
    });
    await expect(container.get('singleton')).rejects.toThrowError(
      'Не найдена зависимость "string" в цепочке вызовов "/singleton"'
    );
    await expect(container.get('factory')).rejects.toThrowError(
      'Не найдена зависимость "string" в цепочке вызовов "/factory/singleton"'
    );
    await expect(container.get('string')).rejects.toThrowError('Сервис "string" не зарегистрирован');
  });

  it('works correctly when errors in parent container', async () => {
    const parent = create({
      services: [
        {
          name: 'squaredTest',
          factory: ({ test }) => test * test,
          dependencies: ['test'],
        },
      ],
    });
    const container = create({
      services: [
        {
          name: 'string',
          value: 'singleton',
        },
      ],
      parent,
    });
    await expect(container.get('squaredTest')).rejects.toThrowError(
      'Не найдена зависимость "test" в цепочке вызовов "/squaredTest"'
    );
    await expect(container.get('test')).rejects.toThrowError('Сервис "test" не зарегистрирован');
  });
});

describe('function createService', () => {
  it('creates service from function correctly', () => {
    const fn = jest.fn();
    const service = createService(
      fn,
      (
        {
          firstTestArg,
          secondTestArg,
          thirdTestArg,
        }
      ) => [thirdTestArg, secondTestArg, firstTestArg]
    );
    service({
      firstTestArg: 1,
      secondTestArg: 2,
      thirdTestArg: 3,
    });
    expect(fn).toHaveBeenCalledWith(3, 2, 1);
  });
});

describe('function createFactory', () => {
  it('creates function, which creates different instances of container on every call', () => {
    const containerFactory = createFactory();
    expect(containerFactory()).not.toBe(containerFactory());
    expect(isContainer(containerFactory())).toBe(true);
  });
});

describe('function createSingleton', () => {
  it('creates function, which creates same instance of container on every call', () => {
    const containerSingleton = createSingleton();
    expect(containerSingleton()).toBe(containerSingleton());
    expect(isContainer(containerSingleton())).toBe(true);
  });
});
