import createConfig from './index';

describe('createConfig', () => {
  it('Works properly', () => {
    const config = createConfig(
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

  it('Works properly when there are no arguments', () => {
    const config = createConfig();
    expect(typeof config).toBe('object');
  });

  it('Call an error when it receives incorrect arguments', () => {
    const config = createConfig();
    expect(typeof config).toBe('object');

    expect(() => createConfig('string')).toThrowError();
    expect(() => createConfig(true)).toThrowError();
    expect(() => createConfig(15)).toThrowError();
    expect(() => createConfig([15])).toThrowError();
    expect(() => createConfig(function () {})).toThrowError();
    expect(() => createConfig(null)).toThrowError();

    expect(() => createConfig({}, 'string')).toThrowError();
    expect(() => createConfig({}, true)).toThrowError();
    expect(() => createConfig({}, 15)).toThrowError();
    expect(() => createConfig({}, [15])).toThrowError();
    expect(() => createConfig({}, function () {})).toThrowError();
    expect(() => createConfig({}, null)).toThrowError();
  });
});
