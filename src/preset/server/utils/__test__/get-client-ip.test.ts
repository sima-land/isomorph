import { getClientIp } from '../get-client-ip';

describe('getClientIp', () => {
  it('should handle "x-client-ip" header', () => {
    const request = new Request('http://test.com', {
      headers: {
        'x-client-ip': '127.1.2.3',
      },
    });

    expect(getClientIp(request)).toBe('127.1.2.3');
  });

  it('should handle "x-forwarded-for" header', () => {
    const request = new Request('http://test.com', {
      headers: {
        'x-forwarded-for': '111.222.111.222',
      },
    });

    expect(getClientIp(request)).toBe('111.222.111.222');
  });
});
