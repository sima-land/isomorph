import { displayUrl } from '../utils';

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
