import {
  getXClientIp,
  getMethod,
  getStatus,
  getOriginalUrl,
  getCookie,
} from '../request-getters';

describe('getXClientIp', () => {
  it('works correctly', () => {
    const request = {
      headers: {
        'x-client-ip': '8.8.8.8',
        'x-forwarded-for': '9.9.9.9',
      },
      connection: {
        remoteAddress: '10.10.10.10',
      },
    };
    const ip = getXClientIp({ request });

    expect(ip).toBe('8.8.8.8');
  });

  it('works correctly when request has no x-client-ip', () => {
    const request = {
      headers: {
        'x-forwarded-for': '9.9.9.9',
      },
      connection: {
        remoteAddress: '10.10.10.10',
      },
    };
    const ip = getXClientIp({ request });

    expect(ip).toBe('9.9.9.9');
  });

  it('works correctly when request has no x-client-ip and x-forwarded-for', () => {
    const request = {
      headers: {},
      connection: {
        remoteAddress: '10.10.10.10',
      },
    };
    const ip = getXClientIp({ request });

    expect(ip).toBe('10.10.10.10');
  });

  it('should return empty string if request contains wrong ip', () => {
    const request = {
      headers: {},
      connection: {
        remoteAddress: 'bad string',
      },
    };
    const ip = getXClientIp({ request });

    expect(ip).toBe('');
  });
});

describe('getMethod', () => {
  it('works correctly', () => {
    const someFunction = () => 'Test';
    const request = {
      method: someFunction,
    };
    const method = getMethod({ request });

    expect(method).toBe(someFunction);
  });
});

describe('getStatus', () => {
  it('works correctly', () => {
    const response = {
      statusCode: 200,
    };
    const status = getStatus({ response });

    expect(status).toBe(200);
  });
});

describe('getOriginalUrl', () => {
  it('works correctly', () => {
    /**
     * Тест.
     * @return {string} Test.
     */
    const someFunction = () => '/test';
    const request = {
      originalUrl: someFunction,
    };
    const originalUrl = getOriginalUrl({ request });

    expect(originalUrl).toBe(someFunction);
  });
});

describe('getCookie', () => {
  it('should return cookie', () => {
    const request = {
      headers: {
        cookie: 'test',
      },

      /**
       * Возвращает содержимое заголовка.
       * @param {string} propName Имя заголовка.
       * @return {string} Содержимое.
       */
      get (propName) {
        return this.headers[propName];
      },
    };

    expect(getCookie(request)).toEqual('test');
  });

  it('should return empty string', () => {
    const request = {
      headers: {},

      /**
       * Возвращает содержимое заголовка.
       * @param {string} propName Имя заголовка.
       * @return {string} Содержимое.
       */
      get (propName) {
        return this.headers[propName];
      },
    };
    expect(getCookie()).toEqual('');
    expect(getCookie(null)).toEqual('');
    expect(getCookie({})).toEqual('');
    expect(getCookie(request)).toEqual('');
  });
});
