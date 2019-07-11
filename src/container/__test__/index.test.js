import create, { createService, getDependencies, isStaticDependency, wrapInContext } from '..';

/**
 * Тестовая функция.
 * @param {Function} getValue Тестовая зависимость.
 * @param {*} initialValue Тестовая зависимость.
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
            /**
             * Тестовая функция.
             * @return {string} Тестовая строка.
             */
            whatIs () {
              return `It is ${string}`;
            },
          }),
          dependencies: ['string'],
        },
        {
          name: 'factory',
          factory: ({ singleton } = {}) => ({
            /**
             * Тестовая функция.
             * @return {string} Тестовая строка.
             */
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

  it('works correctly when service not registered', async () => {
    const container = create();

    await expect(container.get('test')).rejects.toThrowError();
  });

  it('works correctly when service registered incorrect', () => {
    const container = create();

    expect(() => container.set({ name: 'test' })).toThrowError();
  });
});

describe('function isStaticDependency', () => {
  it('should work correctly with static dependency', () => {
    expect(isStaticDependency({ name: 'test', value: 'test' })).toBe(true);
  });
  it('works correctly with renamed dependency', () => {
    expect(isStaticDependency({ name: 'rename' })).toBe(false);
  });
  it('works correctly if dependency.name is not string', () => {
    expect(isStaticDependency({ name: null, value: 123 })).toBe(false);
  });
  it('works correctly if dependency.value is not defined', () => {
    expect(isStaticDependency({ name: 'test' })).toBe(false);
  });
});

describe('function getDependencies', () => {
  it('resolves mixed types of dependencies correctly', async () => {
    /**
     * Тестовая функция.
     * @return {number} Число.
     */
    const firstDependency = () => 1;
    const secondDependency = jest.fn(value => value ? value : 2);
    const container = create({
      services: [
        { name: 'getValue', value: firstDependency },
        { name: 'getValueSecond', value: secondDependency },
        {
          name: 'factory', factory, dependencies: [
            { getValue: 'getValueSecond' },
            { name: 'initialValue', value: 3 },
          ],
        },
      ],
    });
    const { result, getValue, myGetValue } = await getDependencies(
      container,
      [
        {
          result: 'factory',
        },
        'getValue',
        {
          myGetValue: 'getValueSecond',
        },
      ],
    );
    expect(result).toBe(3);
    expect(getValue).toBe(firstDependency);
    expect(myGetValue).toBe(secondDependency);
  });
  it('resolves direct dependencies correctly', async () => {
    const container = create({
      services: [
        {
          name: 'result',
          value: 6,
        },
      ],
    });
    const { result } = await getDependencies(container, ['result']);
    expect(result).toBe(6);
  });
  it('resolves static dependencies correctly', async () => {
    const container = create();
    const { result } = await getDependencies(container, [{ name: 'result', value: 4 }]);
    expect(result).toBe(4);
  });
  it('resolves renamed dependencies correctly', async () => {
    const container = create({
      services: [
        {
          name: 'someValue',
          value: 5,
        },
      ],
    });
    const { result } = await getDependencies(container, [{ result: 'someValue' }]);
    expect(result).toBe(5);
  });
  it('works without errors if "dependencies" is not defined', async () => {
    const container = create();
    await expect(getDependencies(container)).resolves.toEqual({});
  });
  it('works without errors if "dependencies" is defined incorrect', async () => {
    const container = create();
    await expect(getDependencies(container, [{}])).resolves.toEqual({});
  });
});

describe('function wrapInContext', () => {
  it('creates wrapped in context function', async () => {
    const fn = jest.fn((power, result) => `5 to degree ${power} is ${result}`);
    const factory = jest.fn(({ num, power }) => num ** power);
    const container = create(
      {
        services: [
          {
            name: 'firstTestService',
            value: 5,
          },
          {
            name: 'secondTestService',
            factory,
            dependencies: [
              {
                num: 'firstTestService',
              },
            ],
          },
        ],
      }
    );
    container.get = jest.fn(container.get);
    const wrapped = wrapInContext({
      container,
      fn,
      dependencies: [
        {
          result: 'secondTestService',
        },
      ],
      argsToOptions: power => ({ power }),
    });
    expect(await wrapped(2)).toBe('5 to degree 2 is 25');
    expect(fn).toHaveBeenCalledWith(2, 25);
    expect(factory).toHaveBeenCalledWith({ num: 5, power: 2 });
    expect(container.get).toHaveBeenCalledWith('secondTestService', { power: 2 });
    expect(await wrapped(5)).toBe('5 to degree 5 is 3125');
    expect(container.get).toHaveBeenCalledWith('secondTestService', { power: 5 });
  });
  it('creates wrapped in context function if dependencies is not defined', async () => {
    const container = create();
    const fn = jest.fn();
    const wrapped = wrapInContext({ container, fn, argsToOptions: test => ({ test }) });
    await expect(wrapped()).resolves.toEqual();
    await wrapped(5);
    expect(fn).toHaveBeenCalledWith(5);
  });

  const factory = jest.fn(() => 3);
  const container = create(
    {
      services: [
        {
          name: 'test',
          factory,
        },
      ],
    }
  );
  const fn = jest.fn();
  it('creates wrapped in context function if argsToOptions is not defined', async () => {
    const wrapped = wrapInContext({ container, fn, dependencies: ['test'] });
    await expect(wrapped()).resolves.toEqual();
    await wrapped(6);
    expect(fn).toHaveBeenCalledWith(6, 3);
    expect(factory).toHaveBeenCalledWith({});
  });
  it('creates wrapped in context function if argsToOptions is not function', async () => {
    const wrapped = wrapInContext({ container, fn, dependencies: ['test'], argsToOptions: 'I am not a function!' });
    await expect(wrapped()).resolves.toEqual();
    await wrapped(7);
    expect(fn).toHaveBeenCalledWith(7, 3);
    expect(factory).toHaveBeenCalledWith({});
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
