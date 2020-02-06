import {
  getXClientIp,
  getMethod,
  getStatus,
  getOriginalUrl,
  validatePostStatus,
  validateDeleteStatus,
  isOkStatus,
  isValidIp,
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

describe('function isValidIp()', () => {
  it('returns true', () => {
    expect(isValidIp('127.0.0.1')).toBeTruthy();
    expect(isValidIp('0.0.0.0')).toBeTruthy();
    expect(isValidIp('::ffff:127.0.0.1')).toBeTruthy();
    expect(isValidIp('::1')).toBeTruthy();
    expect(isValidIp('::')).toBeTruthy();
    expect(isValidIp('2001:0db8:11a3:09d7:1f34:8a2e:07a0:765d')).toBeTruthy();
    expect(isValidIp('::1f34:8a2e:07a0:765d')).toBeTruthy();
    expect(isValidIp('2001:0db8:11a3::07a0:765d')).toBeTruthy();
    expect(isValidIp('2001:0db8:11a3:09d7:1f34::')).toBeTruthy();
  });

  it('returns false', () => {
    expect(isValidIp('127.001.0.1')).toBeFalsy();
    expect(isValidIp('300.0.0.1')).toBeFalsy();
    expect(isValidIp(':127.0.0.1')).toBeFalsy();
    expect(isValidIp('127.0.0.1wenjwe')).toBeFalsy();
    expect(isValidIp('rebvg127.0.0.1')).toBeFalsy();
    expect(isValidIp('200451:0db8:11a3:09d7:1f34')).toBeFalsy();
    expect(isValidIp('2001:0zz8:11z3:09z7:1z34:aswvgds<zbds')).toBeFalsy();
    expect(isValidIp('dbdzfbvgdz09d7:1f34:8a2e:07a0:765d')).toBeFalsy();
    expect(isValidIp('veryinterestingtext')).toBeFalsy();
    expect(isValidIp()).toBeFalsy();
    expect(isValidIp({})).toBeFalsy();
    expect(isValidIp('')).toBeFalsy();
    expect(isValidIp(null)).toBeFalsy();
    expect(isValidIp(undefined)).toBeFalsy();
    expect(isValidIp('123')).toBeFalsy();
    expect(isValidIp(123)).toBeFalsy();
  });
});
