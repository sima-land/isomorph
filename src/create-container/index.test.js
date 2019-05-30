import createContainer from './index';

describe('createContainer', () => {
  it('works propably', () => {
    const container = createContainer({
      services: [
        {
          name: 'test',
          value: 'test',
        },
        {
          name: 'singleton',
          factory: () => ({
            /**
             * Тестовая функция
             * @return {string} Тестовая строка
             */
            whatIs () {
              return 'It`s singleton';
            },
          }),
          isSingleton: true,
        },
        {
          name: 'factory',
          factory: singleton => ({
            /**
             * Тестовая функция
             * @return {string} Тестовая строка
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

    expect(container.get('test')).toBe('test');
    expect(container.get('singleton').whatIs()).toBe('It`s singleton');
    expect(firstSingleton === secondSingleton).toBeTruthy();
    expect(container.get('factory').whatIs()).toBe('It`s singleton');
  });

  it('works propably when "services" is incorrect in constructor', () => {
    expect(() => createContainer({ services: 2 })).toThrowError();
  });

  it('works properly when there are no arguments in constructor', () => {
    const container = createContainer();
    expect(container.hasOwnProperty('set')).toBe(true);
    expect(container.hasOwnProperty('get')).toBe(true);
  });

  it('works propably when "name" is incorrect in method "set"', () => {
    const container = createContainer();

    expect(() => container.set()).toThrowError();
    expect(() => container.set({ name: '' })).toThrowError();
    expect(() => container.set({ name: 1 })).toThrowError();
  });

  it('works propably when "name" is incorrect in method "get"', () => {
    const container = createContainer();

    expect(() => container.get()).toThrowError();
    expect(() => container.get('')).toThrowError();
    expect(() => container.get(1)).toThrowError();
  });

  it('works propably when service not registered', () => {
    const container = createContainer();

    expect(() => container.get('test')).toThrowError();
  });

  it('works propably when service not registered incorrect', () => {
    const container = createContainer();
    container.set({
      name: 'test',
    });

    expect(() => container.get('test')).toThrowError();
  });
});
