import {
  _sendHttpBreadcrumb,
  _deptToArg,
  createAttachBreadcrumbsMiddleware,
  createHandleExceptionMiddleware,
} from '../error-handlers-middlewares';

describe('_sendHttpBreadcrumb()', () => {
  const sender = jest.fn();
  it('should send breadcrumbs with correct url', () => {
    _sendHttpBreadcrumb(sender, {
      config: {
        url: '/test/',
        baseURL: 'http://test/base/',
      },
    });

    expect(sender).toHaveBeenLastCalledWith({
      category: 'http',
      type: 'http',
      data: {
        url: 'http://test/base/test/',
        status_code: undefined,
        method: undefined,
        params: undefined,
      },
      level: 'error',
    });

    _sendHttpBreadcrumb(sender, {
      config: {
        url: '/test/',
      },
    });

    expect(sender).toHaveBeenLastCalledWith({
      category: 'http',
      type: 'http',
      data: {
        url: '/test/',
        status_code: undefined,
        method: undefined,
        params: undefined,
      },
      level: 'error',
    });
  });

  it('should send breadcrumbs with correct level', () => {
    _sendHttpBreadcrumb(sender, {
      status: 200,
    });

    expect(sender).toHaveBeenLastCalledWith({
      category: 'http',
      type: 'http',
      data: {
        url: undefined,
        status_code: 200,
        method: undefined,
        params: undefined,
      },
      level: 'info',
    });
  });

  it('should send breadcrumbs with correct method & params', () => {
    _sendHttpBreadcrumb(sender, {
      config: {
        method: 'post',
        params: { test: 'test' },
      },
    });

    expect(sender).toHaveBeenLastCalledWith({
      category: 'http',
      type: 'http',
      data: {
        url: undefined,
        status_code: undefined,
        method: 'POST',
        params: { test: 'test' },
      },
      level: 'error',
    });
  });

  it('shouldn`t throw error if sendBreadcrumb is not a function', () => {
    _sendHttpBreadcrumb(null, {});
    expect(_sendHttpBreadcrumb).not.toThrow();
  });
});

describe('_deptToArg', () => {
  it('should work correctly', () => {
    expect(_deptToArg({ sentry: 'test' })).toEqual(['test']);
  });
});

describe('createAttachBreadcrumbsMiddleware()', () => {
  const captureBreadcrumb = jest.fn();
  const dept = { sentry: { captureBreadcrumb } };
  const instance = createAttachBreadcrumbsMiddleware(dept);
  it('should create instance', () => {
    expect(instance).toBeInstanceOf(Function);
    expect(instance).toHaveLength(2);
  });

  it('should capture breadcrumbs for success response', async () => {
    const config = { url: '/test/' };
    const next = jest.fn().mockResolvedValue({
      config: { url: '/test/' },
      status: 200,
    });
    await instance(config, next);
    expect(next).toBeCalledWith(config);
    expect(captureBreadcrumb).toBeCalledWith({
      category: 'http',
      type: 'http',
      data: {
        url: '/test/',
        status_code: 200,
        method: undefined,
        params: undefined,
      },
      level: 'info',
    });
  });

  it('should capture breadcrumbs for failure response with axios error', async () => {
    const config = { url: '/test/' };
    const error = {
      isAxiosError: true,
      response: {
        config: { url: '/test/' },
        status: 404,
      },
    };
    const next = jest.fn().mockRejectedValue(error);
    try {
      await instance(config, next);
    } catch (e) {
      expect(e).toEqual(error);
    }
    expect(next).toBeCalledWith(config);
    expect(captureBreadcrumb).toBeCalledWith({
      category: 'http',
      type: 'http',
      data: {
        url: '/test/',
        status_code: 404,
        method: undefined,
        params: undefined,
      },
      level: 'error',
    });
  });

  it('should capture breadcrumbs for failure response with other error', async () => {
    const config = { url: '/test/' };
    const expected = {
      category: 'http',
      type: 'http',
      data: {
        url: '/test/',
        status_code: undefined,
        method: undefined,
        params: undefined,
      },
      level: 'error',
    };
    const next = jest.fn();
    next.mockRejectedValueOnce(null);
    try {
      await instance(config, next);
    } catch (e) {
      expect(e).toEqual(null);
    }
    expect(next).toBeCalledWith(config);
    expect(captureBreadcrumb).toBeCalledWith(expected);

    next.mockRejectedValueOnce(new Error('testError'));
    try {
      await instance(config, next);
    } catch (e) {
      expect(e.message).toEqual('testError');
    }
    expect(next).toBeCalledWith(config);
    expect(captureBreadcrumb).toBeCalledWith(expected);
  });
});

describe('createHandleExceptionMiddleware()', () => {
  const captureExtendedException = jest.fn();
  const dept = { sentry: { captureExtendedException } };
  const instance = createHandleExceptionMiddleware(dept);

  it('should create instance', () => {
    expect(instance).toBeInstanceOf(Function);
    expect(instance).toHaveLength(2);
  });

  it('shouldn`t capture exception for success response', async () => {
    const config = { url: '/test/' };
    const next = jest.fn().mockResolvedValue({
      config: { url: '/test/' },
      status: 200,
    });
    await instance(config, next);
    expect(next).toBeCalledWith(config);
    expect(captureExtendedException).not.toBeCalled();
  });

  it('should capture exception for failure response', async () => {
    const config = {
      url: '/test/',
      baseURL: '/base/',
      headers: 'test_headers',
      data: 'test_data',
      method: 'get',
      params: 'test_params',
      otherProp: 'test',
    };
    const error = new Error('testError');
    const next = jest.fn().mockRejectedValue(error);
    await instance(config, next);
    expect(next).toBeCalledWith(config);
    expect(captureExtendedException).toBeCalledWith(
      error,
      {
        url: '/test/',
        baseURL: '/base/',
        headers: 'test_headers',
        data: 'test_data',
        method: 'get',
        params: 'test_params',
      },
      {
        dataName: 'Request details',
        dataAsContext: true,
      }
    );
  });

  it('shouldn`t throw error if captureExtendedException not defined', async () => {
    const config = { url: '/test/' };
    const next = jest.fn().mockRejectedValue(new Error());
    const badInstance = createHandleExceptionMiddleware({ sentry: {} });
    try {
      await badInstance(config, next);
    } catch (e) {
      expect(e).toBeUndefined();
    }
    expect.assertions(0);
  });
});
