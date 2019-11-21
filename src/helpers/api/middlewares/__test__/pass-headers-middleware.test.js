import createPassHeadersMiddleware from '../pass-headers-middleware';

describe('createPassHeadersMiddleware', () => {
  const requestWithoutCookie = {
    get: jest.fn(),
  };
  const requestWithCookie = {
    get: jest.fn(() => 'test'),
  };
  it('creates passHeadersMiddleware instance correctly', () => {
    const passHeadersMiddleware = createPassHeadersMiddleware({
      request: requestWithCookie,
      ip: '127.0.0.1',
      serviceUserAgent: 'simaland-product/test',
    });
    expect(passHeadersMiddleware).toBeInstanceOf(Function);
    expect(passHeadersMiddleware).toHaveLength(2);
  });
  describe('creates passHeadersMiddleware instance, which', () => {
    it('adds correct headers to axios request config, when creation params is correct', async () => {
      const instance = createPassHeadersMiddleware({
        request: requestWithCookie,
        ip: '127.0.0.1',
        serviceUserAgent: 'simaland-product/test',
      });
      const requestConfig = { test: 'test', headers: {} };
      const next = jest.fn();
      await instance(requestConfig, next);
      expect(next).toHaveBeenCalledWith({
        test: 'test',
        headers: {
          Cookie: 'test',
          'User-Agent': 'simaland-product/test',
          'X-Client-Ip': '127.0.0.1',
        },
      });
    });
    it('adds correct headers to axios request config, when creation params is not correct', async () => {
      const instance = createPassHeadersMiddleware({
        request: requestWithoutCookie,
        config: {},
      });
      const requestConfig = { test: 'test', headers: {} };
      const next = jest.fn();
      await instance(requestConfig, next);
      expect(next).toHaveBeenCalledWith({
        test: 'test',
        headers: {
          Cookie: '',
          'User-Agent': '',
          'X-Client-Ip': '',
        },
      });
    });
    it('adds correct headers to axios request config, when headers is not defined in requestConfig', async () => {
      const instance = createPassHeadersMiddleware({
        request: requestWithCookie,
        ip: '127.0.0.1',
        serviceUserAgent: 'simaland-product/test',
      });
      const requestConfig = {};
      const next = jest.fn();
      await instance(requestConfig, next);
      expect(next).toHaveBeenCalledWith({
        headers: {
          Cookie: 'test',
          'User-Agent': 'simaland-product/test',
          'X-Client-Ip': '127.0.0.1',
        },
      });
    });
  });
});
