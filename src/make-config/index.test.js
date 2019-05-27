import makeConfig from './index';

describe('makeConfig', () => {
  it('Функция makeConfig работает корректно', () => {
    const config = makeConfig(
      {
        firstKey: 2,
        secondKey: 3,
        fourthKey: 4,
      },
      {
        FIRST_KEY: 1,
        fourthKey: 5,
      }
    );

    expect(config).toStrictEqual({
      firstKey: 1,
      secondKey: 3,
      fourthKey: 5,
    });
  });

  it('Функция makeConfig корректно работает без входящих параметров', () => {
    const config = makeConfig();
    expect(typeof config).toBe('object');
  });

  it('Функция makeConfig падает если пришли некорректные параметры', () => {
    const config = makeConfig();
    expect(typeof config).toBe('object');

    expect(() => makeConfig('string')).toThrowError();
    expect(() => makeConfig(true)).toThrowError();
    expect(() => makeConfig(15)).toThrowError();
    expect(() => makeConfig([15])).toThrowError();
    expect(() => makeConfig(function () {})).toThrowError();
    expect(() => makeConfig(null)).toThrowError();

    expect(() => makeConfig({}, 'string')).toThrowError();
    expect(() => makeConfig({}, true)).toThrowError();
    expect(() => makeConfig({}, 15)).toThrowError();
    expect(() => makeConfig({}, [15])).toThrowError();
    expect(() => makeConfig({}, function () {})).toThrowError();
    expect(() => makeConfig({}, null)).toThrowError();
  });
});
