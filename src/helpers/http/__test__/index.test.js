import {
  getXClientIp,
  getMethod,
  getStatus,
  getOriginalUrl,
  validatePostStatus,
  validateDeleteStatus,
  isOkStatus,
} from '..';

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
    /**
     * Тест.
     * @return {string} Test.
     */
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

describe('function validatePostStatus()', () => {
  it('returns correct data', () => {
    expect(validatePostStatus(201)).toBeTruthy();
    expect(validatePostStatus(500)).toBeFalsy();
  });
});

describe('function validateDeleteStatus()', () => {
  it('returns correct data', () => {
    expect(validateDeleteStatus(204)).toBeTruthy();
    expect(validateDeleteStatus(500)).toBeFalsy();
  });
});

describe('function isOkStatus()', () => {
  it('returns correct data', () => {
    expect(isOkStatus(204)).toBeFalsy();
    expect(isOkStatus(500)).toBeFalsy();
    expect(isOkStatus(200)).toBeTruthy();
  });
});
