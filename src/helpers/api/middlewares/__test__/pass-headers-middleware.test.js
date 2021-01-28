import { createPassHeadersMiddleware } from '../pass-headers-middleware';

describe('createPassHeadersMiddleware', () => {
  it('creates passHeadersMiddleware instance correctly', () => {
    const passHeadersMiddleware = createPassHeadersMiddleware({});
    expect(passHeadersMiddleware).toBeInstanceOf(Function);
    expect(passHeadersMiddleware).toHaveLength(2);
  });
  describe('creates passHeadersMiddleware instance, which', () => {
    it('adds correct headers to axios request config', async () => {
      const instance = createPassHeadersMiddleware({
        headers: {
          Cookie: 'test',
          'User-Agent': 'simaland-product/test',
          'X-Client-Ip': '127.0.0.1',
        },
      });
      const requestConfig = { test: 'test', headers: { 'content-length': '1000' } };
      const next = jest.fn();
      await instance(requestConfig, next);
      expect(next).toHaveBeenCalledWith({
        test: 'test',
        headers: {
          'content-length': '1000',
          Cookie: 'test',
          'User-Agent': 'simaland-product/test',
          'X-Client-Ip': '127.0.0.1',
        },
      });
    });
    it('adds correct headers to axios request config if headers not pass', async () => {
      const instance = createPassHeadersMiddleware({});
      const requestConfig = { test: 'test', headers: { 'content-length': '1000' } };
      const next = jest.fn();
      await instance(requestConfig, next);
      expect(next).toHaveBeenCalledWith({
        test: 'test',
        headers: {
          'content-length': '1000',
        },
      });
    });
    it('adds correct headers to axios request config, when headers is not defined in requestConfig', async () => {
      const instance = createPassHeadersMiddleware({
        headers: {
          Cookie: 'test',
          'User-Agent': 'simaland-product/test',
          'X-Client-Ip': '127.0.0.1',
        },
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
