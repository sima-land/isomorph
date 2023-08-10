import { applyAxiosDefaults } from '..';

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
