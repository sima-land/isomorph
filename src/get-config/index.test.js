import getConfig from './index';

describe('getConfig', () => {
  it('Функция getConfig работает корректно', () => {
    const config = getConfig(
      {
        firstKey: 2,
        secondKey: 3,
        fourthKey: 4,
      },
      {
        FIRST_KEY: 1,
        fourthKey: 5,
      });

    expect(config).toStrictEqual({
      firstKey: 1,
      secondKey: 3,
      fourthKey: 5,
    });
  });

  it('Функция getConfig корректно работает без входящих параметров', () => {
    const config = getConfig();
    expect(typeof config).toBe('object');
  });

  it('Функция getConfig падает если пришли некорректные параметры', () => {
    const config = getConfig();
    expect(typeof config).toBe('object');

    expect(() => getConfig('string')).toThrowError();
    expect(() => getConfig(true)).toThrowError();
    expect(() => getConfig(15)).toThrowError();
    expect(() => getConfig([15])).toThrowError();
    expect(() => getConfig(function () {})).toThrowError();
    expect(() => getConfig(null)).toThrowError();

    expect(() => getConfig({}, 'string')).toThrowError();
    expect(() => getConfig({}, true)).toThrowError();
    expect(() => getConfig({}, 15)).toThrowError();
    expect(() => getConfig({}, [15])).toThrowError();
    expect(() => getConfig({}, function () {})).toThrowError();
    expect(() => getConfig({}, null)).toThrowError();
  });
});
