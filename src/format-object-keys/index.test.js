import formatObjectKeys from './index';

describe('formatObjectKeys', () => {
  it('Функция formatObjectKeys работает корректно', () => {
    const formattedObject = formatObjectKeys({
      FIRST_KEY: 1,
      SecondKey: 2,
      'third-key': 3,
      fourthKey: 4,
    });

    expect(formattedObject).toStrictEqual({
      firstKey: 1,
      secondKey: 2,
      thirdKey: 3,
      fourthKey: 4,
    });
  });

  it('Функция formatObjectKeys падает без входящих параметров', () => {
    expect(() => formatObjectKeys()).toThrowError();
  });

  it('Функция formatObjectKeys падает если пришли некорректные параметры', () => {
    expect(() => formatObjectKeys('string')).toThrowError();
    expect(() => formatObjectKeys(true)).toThrowError();
    expect(() => formatObjectKeys(15)).toThrowError();
    expect(() => formatObjectKeys([15])).toThrowError();
    expect(() => formatObjectKeys(function () {})).toThrowError();
    expect(() => formatObjectKeys(null)).toThrowError();
  });
});
