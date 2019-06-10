import createProxy from './index';
import createProxyHandler from './create-proxy-handler';

jest.mock('./create-proxy-handler', () => jest.fn(() => 'test'));
const app = { use: jest.fn() };

describe('createProxy()', () => {
  it('works correctly', () => {
    const config = {
      simalandApiURL: 'https://www.sima-land.ru/api/v3/*',
      chponkiApiURL: 'https://chponki.sima-land.ru/api/v2/*',
      proxy: [
        {
          url: '/api/*',
          header: 'Simaland-Service-Origin',
          map: {
            sima: ({ simalandApiURL }) => simalandApiURL,
            chponki: ({ chponkiApiURL }) => chponkiApiURL,
          },
        },
      ],
    };
    const proxy = createProxy({ config });

    proxy(app);
    expect(createProxyHandler).toHaveBeenCalledWith(
      'Simaland-Service-Origin',
      config.proxy[0].map,
      config
    );
    expect(app.use).toHaveBeenCalledWith('/api/*', 'test');
  });

  it('shows error if proxy not Array', () => {
    const config = { proxy: 'test' };
    const proxy = createProxy({ config });

    expect(() => proxy(app)).toThrowError();
  });
});
