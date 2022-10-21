import { displayUrl, applyAxiosDefaults } from '../utils';

describe('displayUrl', () => {
  it('should properly merge baseURL with url', () => {
    const cases: Array<{ url: string; baseURL: string; expectedUrl: string }> = [
      // baseURL и url
      {
        baseURL: 'https://www.base.com/',
        url: '/user/current',
        expectedUrl: 'https://www.base.com/user/current',
      },
      {
        baseURL: 'https://www.base.com',
        url: 'user/current',
        expectedUrl: 'https://www.base.com/user/current',
      },
      {
        baseURL: 'https://www.base.com',
        url: '/user/current',
        expectedUrl: 'https://www.base.com/user/current',
      },
      {
        baseURL: 'https://www.base.com/',
        url: 'admin/all',
        expectedUrl: 'https://www.base.com/admin/all',
      },

      // только baseURL
      {
        baseURL: 'www.test.com',
        url: '',
        expectedUrl: 'www.test.com',
      },
      {
        baseURL: 'www.test.com/',
        url: '',
        expectedUrl: 'www.test.com/',
      },

      // только url
      {
        baseURL: '',
        url: '/hello/world',
        expectedUrl: '/hello/world',
      },
      {
        baseURL: '',
        url: 'some/path',
        expectedUrl: 'some/path',
      },

      // ничего
      {
        baseURL: '',
        url: '',
        expectedUrl: '[empty]',
      },
    ];

    for (const { baseURL, url, expectedUrl } of cases) {
      expect(displayUrl(baseURL, url)).toBe(expectedUrl);
    }
  });
});

describe('applyAxiosDefaults', () => {
  it('should merge config and defaults properly', () => {
    const result = applyAxiosDefaults(
      {
        url: 'currency/',
      },
      {
        baseURL: 'https://www.data.com/',
        headers: {
          common: {},
          delete: {},
          get: { bar: 'bar-value' },
          head: {},
          post: {},
          put: {},
          patch: {},
          options: {},
          purge: {},
          link: {},
          unlink: {},
        },
      },
    );

    expect(result.url).toBe('currency/');
    expect(result.baseURL).toBe('https://www.data.com/');
  });

  it('should merge config and defaults properly when headers provided but method is not', () => {
    const result = applyAxiosDefaults(
      {
        url: 'currency/',
        headers: { foo: 'foo-value' },
      },
      {
        baseURL: 'https://www.data.com/',
        headers: {
          common: {},
          delete: {},
          get: { bar: 'bar-value' },
          head: {},
          post: {},
          put: {},
          patch: {},
          options: {},
          purge: {},
          link: {},
          unlink: {},
        },
      },
    );

    expect(result.url).toBe('currency/');
    expect(result.baseURL).toBe('https://www.data.com/');
    expect(result.headers).toEqual({ foo: 'foo-value', bar: 'bar-value' });
  });

  it('should merge config and defaults properly when method provided', () => {
    const result = applyAxiosDefaults(
      {
        method: 'post',
        url: 'currency/',
        headers: { foo: 'foo-value' },
      },
      {
        baseURL: 'https://www.data.com/',
        headers: {
          common: {},
          delete: {},
          get: { bar: 'bar-value' },
          head: {},
          post: { baz: 'baz-value' },
          put: {},
          patch: {},
          options: {},
          purge: {},
          link: {},
          unlink: {},
        },
      },
    );

    expect(result.url).toBe('currency/');
    expect(result.baseURL).toBe('https://www.data.com/');
    expect(result.headers).toEqual({ foo: 'foo-value', baz: 'baz-value' });
  });
});
