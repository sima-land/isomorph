import createContainer from '..';

describe('createContainer', () => {
  it('container creates correctly', () => {
    const container = createContainer({
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

    const firstSingleton = container.get('singleton');
    const secondSingleton = container.get('singleton');

    expect(container.get('string')).toBe('singleton');
    expect(container.get('singleton').whatIs()).toBe('It is singleton');
    expect(firstSingleton === secondSingleton).toBeTruthy();
    expect(container.get('factory').whatIs()).toBe('It is singleton');
  });

  it ('method getDependencies() works correctly when dependency is Object', () => {
    /**
     * Тестовая функция.
     * @param {Function} getValue Тестовая зависимость.
     * @return {*} Тестовый результат.
     */
    const factory = ({ getValue }) => getValue();
    const container = createContainer({
      services: [
        { name: 'getValue', value: () => 1 },
        { name: 'getValueSecond', value: () => 2 },
        { name: 'factory', factory, dependencies: [{ getValue: 'getValueSecond' }] },
      ],
    });

    expect(container.get('factory')).toBe(2);
  });

  it('method works correctly when "services" is incorrect in constructor', () => {
    expect(() => createContainer({ services: 2 })).toThrowError();
  });

  it('works correctly when there are no arguments in constructor', () => {
    const container = createContainer();

    expect(container.hasOwnProperty('set')).toBe(true);
    expect(container.hasOwnProperty('get')).toBe(true);
  });

  it('works correctly when "name" is incorrect in method "set"', () => {
    const container = createContainer();

    expect(() => container.set()).toThrowError();
    expect(() => container.set({ name: '' })).toThrowError();
    expect(() => container.set({ name: 1 })).toThrowError();
  });

  it('works correctly when "factory" is incorrect in method "set"', () => {
    const container = createContainer();

    expect(() => container.set({ name: 'test', factory: 1 })).toThrowError();
  });

  it('works correctly when "singleton" is incorrect in method "set"', () => {
    const container = createContainer();

    expect(() => container.set({ name: 'test', singleton: 1 })).toThrowError();
  });

  it('works correctly when "name" is incorrect in method "get"', () => {
    const container = createContainer();

    expect(() => container.get()).toThrowError();
    expect(() => container.get('')).toThrowError();
    expect(() => container.get(1)).toThrowError();
  });

  it('works correctly when service not registered', () => {
    const container = createContainer();

    expect(() => container.get('test')).toThrowError();
  });

  it('works correctly when service registered incorrect', () => {
    const container = createContainer();

    expect(() => container.set({ name: 'test' })).toThrowError();
  });
});
