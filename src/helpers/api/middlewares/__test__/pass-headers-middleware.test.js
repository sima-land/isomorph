import { createPassHeadersMiddleware, prepareRequestHeaders } from '../pass-headers-middleware';
import { getXClientIp, getCookie } from '../../../http/request-getters';
import { getServiceHeaders, getServiceUserAgent } from '../helpers';

jest.mock('../../../http/request-getters', () => {
  const original = jest.requireActual('../../../http/request-getters');
  return {
    ...original,
    __esModule: true,
    getXClientIp: jest.fn().mockReturnValue('ip'),
    getCookie: jest.fn().mockReturnValue('cookie'),
  };
});

jest.mock('../helpers', () => {
  const original = jest.requireActual('../helpers');
  return {
    ...original,
    __esModule: true,
    getServiceHeaders: jest.fn().mockReturnValue({ 'Simaland-Headers': 'test' }),
    getServiceUserAgent: jest.fn().mockReturnValue('UserAgent'),
  };
});

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

describe('prepareRequestHeaders', () => {
  it('should create header object', () => {
    const request = { test: 'test_request' };
    const config = { test: 'test_config' };
    expect(prepareRequestHeaders({ request, config })).toEqual({
      'X-Client-Ip': 'ip',
      'User-Agent': 'UserAgent',
      Cookie: 'cookie',
      'Simaland-Headers': 'test',
    });
    expect(getXClientIp).toBeCalledWith({ request });
    expect(getCookie).toBeCalledWith(request);
    expect(getServiceHeaders).toBeCalledWith(request);
    expect(getServiceUserAgent).toBeCalledWith(config);
  });
});
