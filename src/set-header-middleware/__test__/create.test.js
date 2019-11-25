import createSetHeaderMiddleware from '../create';

describe('createSetHeaderMiddleware()', () => {
  const testDependencies = {
    headers: {
      'Test-Js-Header-Name': '/bundle.js',
      'Test-Css-Header-Name': '/bundle.css',
    },
  };

  it('should create middleware correctly', () => {
    const middleware = createSetHeaderMiddleware(testDependencies);

    expect(middleware).toBeInstanceOf(Function);
  });

  it('should set headers', () => {
    const middleware = createSetHeaderMiddleware(testDependencies);
    const response = { set: jest.fn() };
    const next = jest.fn();

    expect(response.set).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(0);

    middleware({}, response, next);

    expect(next).toBeCalledTimes(1);
    expect(response.set).toBeCalledTimes(2);
    expect(response.set).toHaveBeenNthCalledWith(1, {
      'Test-Js-Header-Name': '/bundle.js',
    });
    expect(response.set).toHaveBeenNthCalledWith(2, {
      'Test-Css-Header-Name': '/bundle.css',
    });
  });

  it('shouldn`t set header if header param is empty', () => {
    const middleware = createSetHeaderMiddleware({});
    const response = { set: jest.fn() };
    const next = jest.fn();

    expect(response.set).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(0);

    middleware({}, response, next);

    expect(response.set).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
  });

  it('shouldn`t set header if header not pass', () => {
    const middleware = createSetHeaderMiddleware({});
    const response = { set: jest.fn() };
    const next = jest.fn();

    expect(response.set).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(0);

    middleware({}, response, next);

    expect(response.set).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
  });
});
