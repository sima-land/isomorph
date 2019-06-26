import { getXClientIp, getMethod, getStatus } from '..';

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
});

describe('getMethod', () => {
  it('works correctly', () => {
    /**
     * Тест
     * @return {string} Test
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
