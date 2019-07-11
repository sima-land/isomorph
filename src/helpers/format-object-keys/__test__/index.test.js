import formatObjectKeys from '../index';

describe('function formatObjectKeys()', () => {
  it('works properly', () => {
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

  it('call an error when there are no arguments', () => {
    expect(() => formatObjectKeys()).toThrowError();
  });

  it('call an error when it receives incorrect arguments', () => {
    expect(() => formatObjectKeys('string')).toThrowError();
    expect(() => formatObjectKeys(true)).toThrowError();
    expect(() => formatObjectKeys(15)).toThrowError();
    expect(() => formatObjectKeys([15])).toThrowError();
    expect(() => formatObjectKeys(function () {})).toThrowError();
    expect(() => formatObjectKeys(null)).toThrowError();
  });
});
