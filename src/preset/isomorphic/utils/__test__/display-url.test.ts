import { displayUrl } from '../display-url';

describe('displayUrl', () => {
  const cases: Array<{ name: string; url: string; baseURL: string; expectedUrl: string }> = [
    // baseURL и url
    {
      name: 'baseURL (with trailing slash) + url (with leading slash)',
      baseURL: 'https://www.base.com/',
      url: '/user/current',
      expectedUrl: 'https://www.base.com/user/current',
    },
    {
      name: 'baseURL (no trailing slash) + url (no leading slash)',
      baseURL: 'https://www.base.com',
      url: 'user/current',
      expectedUrl: 'https://www.base.com/user/current',
    },
    {
      name: 'baseURL (no trailing slash) + url (with leading slash)',
      baseURL: 'https://www.base.com',
      url: '/user/current',
      expectedUrl: 'https://www.base.com/user/current',
    },
    {
      name: 'baseURL (with trailing slash) + url (no leading slash)',
      baseURL: 'https://www.base.com/',
      url: 'admin/all',
      expectedUrl: 'https://www.base.com/admin/all',
    },

    // только baseURL
    {
      name: 'only baseURL',
      baseURL: 'www.test.com',
      url: '',
      expectedUrl: 'www.test.com',
    },
    {
      name: 'only baseURL (with trailing slash)',
      baseURL: 'www.test.com/',
      url: '',
      expectedUrl: 'www.test.com/',
    },

    // только url
    {
      name: 'only url (with leading slash)',
      baseURL: '',
      url: '/hello/world',
      expectedUrl: '/hello/world',
    },
    {
      name: 'only url (no leading slash)',
      baseURL: '',
      url: 'some/path',
      expectedUrl: 'some/path',
    },

    // ничего
    {
      name: 'no baseURL + no url',
      baseURL: '',
      url: '',
      expectedUrl: '[empty]',
    },
  ];

  for (const { baseURL, url, expectedUrl, ...meta } of cases) {
    it(`${meta.name}`, () => {
      expect(displayUrl(baseURL, url)).toBe(expectedUrl);
    });
  }
});
