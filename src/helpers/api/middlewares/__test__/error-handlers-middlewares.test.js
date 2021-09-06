import {
  _sendHttpBreadcrumb,
  _deptToArg,
  createAttachBreadcrumbsMiddleware,
  createHandleExceptionMiddleware,
  _getLevelFromConfig,
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
      category: 'http.response',
      type: 'http',
      data: {
        url: 'http://test/base/test/',
        status_code: 'UNKNOWN',
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
      category: 'http.response',
      type: 'http',
      data: {
        url: '/test/',
        status_code: 'UNKNOWN',
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
      category: 'http.response',
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
      category: 'http.response',
      type: 'http',
      data: {
        url: undefined,
        status_code: 'UNKNOWN',
        method: 'POST',
        params: { test: 'test' },
      },
      level: 'error',
    });
  });

  it('should send breadcrumbs as request breadcrumbs', () => {
    _sendHttpBreadcrumb(sender, {
      config: {
        method: 'post',
        params: { test: 'test' },
      },
    }, true);

    expect(sender).toHaveBeenLastCalledWith({
      category: 'http.request',
      type: 'http',
      data: {
        url: undefined,
        status_code: 'FETCHING',
        method: 'POST',
        params: { test: 'test' },
      },
      level: 'info',
    });
  });

  it('shouldn`t throw error if sendBreadcrumb is not a function', () => {
    _sendHttpBreadcrumb(null, {});
    expect(_sendHttpBreadcrumb).not.toThrow();
  });

  it('shouldn`t throw error if response not pass', () => {
    _sendHttpBreadcrumb(sender);
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
    expect(instance).toHaveLength(3);
  });

  it('should capture breadcrumbs for success response', async () => {
    const config = { url: '/test/' };
    const next = jest.fn().mockResolvedValue({
      config: { url: '/test/' },
      status: 200,
    });
    await instance(config, next);
    expect(next).toBeCalledWith(config);
    expect(captureBreadcrumb).toBeCalledTimes(2);
    expect(captureBreadcrumb).toHaveBeenNthCalledWith(1, {
      category: 'http.request',
      type: 'http',
      data: {
        url: '/test/',
        status_code: 'FETCHING',
        method: undefined,
        params: undefined,
      },
      level: 'info',
    });
    expect(captureBreadcrumb).toHaveBeenNthCalledWith(2, {
      category: 'http.response',
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

  it('should capture breadcrumbs for axios error with response', async () => {
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
    expect(captureBreadcrumb).toBeCalledTimes(2);
    expect(captureBreadcrumb).toHaveBeenNthCalledWith(1, {
      category: 'http.request',
      type: 'http',
      data: {
        url: '/test/',
        status_code: 'FETCHING',
        method: undefined,
        params: undefined,
      },
      level: 'info',
    });
    expect(captureBreadcrumb).toHaveBeenNthCalledWith(2, {
      category: 'http.response',
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

  it('should capture only request breadcrumb for other error', async () => {
    const config = { url: '/test/' };
    const expectedRequestData = {
      category: 'http.request',
      type: 'http',
      data: {
        url: '/test/',
        status_code: 'FETCHING',
        method: undefined,
        params: undefined,
      },
      level: 'info',
    };
    const next = jest.fn();

    next.mockRejectedValueOnce({ isAxiosError: true });
    try {
      await instance(config, next);
    } catch (e) {
      expect(e).toEqual({ isAxiosError: true });
    }
    expect(next).toBeCalledWith(config);
    expect(captureBreadcrumb).toBeCalledTimes(1);
    expect(captureBreadcrumb).toHaveBeenLastCalledWith(expectedRequestData);

    next.mockRejectedValueOnce({ response: {
      config: { url: '/test/' },
      status: 404,
    } });
    try {
      await instance(config, next);
    } catch (e) {
      expect(e).toEqual({ response: {
        config: { url: '/test/' },
        status: 404,
      } });
    }
    expect(next).toBeCalledWith(config);
    expect(captureBreadcrumb).toBeCalledTimes(2);
    expect(captureBreadcrumb).toHaveBeenLastCalledWith(expectedRequestData);

    next.mockRejectedValueOnce(new Error('testError'));
    try {
      await instance(config, next);
    } catch (e) {
      expect(e.message).toEqual('testError');
    }
    expect(next).toBeCalledWith(config);
    expect(captureBreadcrumb).toBeCalledTimes(3);
    expect(captureBreadcrumb).toHaveBeenLastCalledWith(expectedRequestData);
  });
});

describe('createHandleExceptionMiddleware()', () => {
  const captureExtendedException = jest.fn();
  const dept = { sentry: { captureExtendedException } };
  const instance = createHandleExceptionMiddleware(dept);

  it('should create instance', () => {
    expect(instance).toBeInstanceOf(Function);
    expect(instance).toHaveLength(3);
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
        level: 'warning',
      }
    );
  });

  it('should capture exception for failure response with log level config', async () => {
    const config = {
      url: '/test/',
      baseURL: '/base/',
      headers: 'test_headers',
      data: 'test_data',
      method: 'get',
      params: 'test_params',
      otherProp: 'test',
      logLevelConfig: { default: 'error', 422: 'warning' },
    };
    const error = {
      isAxiosError: true,
      response: { status: 422 },
    };
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
        level: 'warning',
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

describe('_getLevelFromConfig', () => {
  it('should return default value', () => {
    expect(_getLevelFromConfig(undefined, undefined)).toEqual('warning');
    expect(_getLevelFromConfig(undefined, { default: 'error' })).toEqual('error');
  });
  it('should return corresponding to status value', () => {
    expect(_getLevelFromConfig(422, { default: 'error', 422: 'warning' })).toEqual('warning');
  });
});
