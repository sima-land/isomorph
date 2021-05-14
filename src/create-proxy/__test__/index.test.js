import createProxy from '..';
import createProxyMiddleware from '../create-proxy-middleware';

jest.mock('../create-proxy-middleware', () => jest.fn(() => 'test'));
const app = { use: jest.fn() };

describe('createProxy()', () => {
  it('works correctly', () => {
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
    const proxy = createProxy({ config });

    proxy(app);
    expect(createProxyMiddleware).toHaveBeenCalledWith(
      'Simaland-Service-Origin',
      config.proxy[0].map,
      config,
      'test'
    );
    expect(app.use).toHaveBeenCalledWith('/api/*', 'test');
  });

  it('shows error if proxy not Array', () => {
    const config = { proxy: 'test' };
    const proxy = createProxy({ config });

    expect(() => proxy(app)).toThrowError();
  });
});
