import createProxyMiddleware, { getRequestPathResolver, getUrlPath } from '..';
import expressProxy from 'express-http-proxy';

const config = {
  simalandApiURL: 'https://www.sima-land.ru',
  chponkiApiURL: 'https://chponki.sima-land.ru',
  proxy: [
    {
      url: '/api/*',
      header: 'Simaland-Service-Origin',
      map: {
        sima: ({ simalandApiURL }) => simalandApiURL,
        chponki: ({ chponkiApiURL }) => chponkiApiURL,
      },
      proxyOptions: {
        test: 'test',
      },
    },
  ],
};

const proxyOptions = config.proxy[0].proxyOptions;
const header = config.proxy[0].header;
const map = config.proxy[0].map;

describe('requestPathResolver', () => {
  it('returns original URL from request', () => {
    const requestResolver = getRequestPathResolver('');
    expect(requestResolver({ originalUrl: '/test/test/' })).toEqual('/test/test/');
  });
  it('returns original URL with path from request', () => {
    const requestResolver = getRequestPathResolver('/sparta');
    expect(requestResolver({ originalUrl: '/test/test/' })).toEqual('/sparta/test/test/');
  });
  it('does not return original URL if request is not passed', () => {
    const requestResolver = getRequestPathResolver('');
    expect(requestResolver()).toBeUndefined();
  });
});

describe('createProxyMiddleware()', () => {
  afterEach(() => {
    expressProxy.mockClear();
  });

  it('works correctly with header', () => {
    const proxy = createProxyMiddleware(header, map, config, proxyOptions);
    const next = jest.fn();

    proxy(
      { headers: { 'simaland-service-origin': 'sima' } },
      {},
      next
    );
    expect(expressProxy.mock.calls).toHaveLength(1);
    expect(expressProxy.mock.calls[0][0]).toBe(config.simalandApiURL);
    expect(expressProxy.mock.calls[0][1]).toMatchObject({
      proxyReqPathResolver: expect.any(Function), ...proxyOptions,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('works correctly without header', () => {
    const proxy = createProxyMiddleware(header, map, config);
    const next = jest.fn();

    proxy(
      { headers: {} },
      {},
      next
    );
    expect(expressProxy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});

describe('getUrlPath()', () => {
  it('should work correctly', () => {
    expect(getUrlPath('http://test.ru/sparta/')).toEqual('/sparta');
    expect(getUrlPath('http://test.ru/sparta')).toEqual('/sparta');
    expect(getUrlPath('http://test.ru/')).toEqual('');
    expect(getUrlPath('http://test.ru')).toEqual('');
    expect(getUrlPath('/')).toEqual('');
  });
});
