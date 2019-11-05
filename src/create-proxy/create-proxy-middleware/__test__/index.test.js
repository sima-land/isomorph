import createProxyMiddleware, { requestPathResolver } from '..';
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
      proxyOptions: 'test',
    },
  ],
};

const proxyOptions = config.proxy[0].proxyOptions;
const header = config.proxy[0].header;
const map = config.proxy[0].map;

describe('requestPathResolver', () => {
  it('returns original URL from request', () => {
    expect(requestPathResolver({ originalUrl: '/test/test/' })).toEqual('/test/test/');
  });
  it('does not return original URL if request is not passed', () => {
    expect(requestPathResolver()).toBeUndefined();
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
    expect(expressProxy).toHaveBeenCalledWith(config.simalandApiURL, {
      proxyReqPathResolver: requestPathResolver, ...proxyOptions,
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
