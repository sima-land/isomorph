import { getForwardedHeaders } from '../get-forwarded-headers';

describe('getForwardedHeaders', () => {
  it('should contain headers by convention', () => {
    const config = { appName: 'app_name', appVersion: 'version', env: 'env' };
    const request = new Request('http://test.com', {
      headers: {
        'x-client-ip': '127.0.0.89',
        'simaland-foo': 'hello',
        'simaland-bar': 'world',
        'simaland-params': JSON.stringify({ testParam: 123 }),
      },
    });
    const result = getForwardedHeaders(config, request);

    expect(result.get('user-agent')).toBe('simaland-app_name/version');
    expect(result.get('x-client-ip')).toBe('127.0.0.89');
    expect(result.get('simaland-foo')).toBe('hello');
    expect(result.get('simaland-bar')).toBe('world');
    expect(result.get('simaland-params')).toBe(null);
  });

  it('should not contain x-client-ip when client ip is not defined', () => {
    const config = { appName: 'app_name', appVersion: 'version', env: 'env' };
    const request = new Request('http://test.com', {
      headers: {
        'simaland-foo': 'hello',
        'simaland-bar': 'world',
      },
    });
    const result = getForwardedHeaders(config, request);

    expect(result.get('user-agent')).toBe('simaland-app_name/version');
    expect(result.get('x-client-ip')).toBe(null);
    expect(result.get('simaland-foo')).toBe('hello');
    expect(result.get('simaland-bar')).toBe('world');
  });

  it('should forward cookie when it is present', () => {
    const config = { appName: 'app_name', appVersion: 'version', env: 'env' };
    const request = new Request('http://test.com', {
      headers: {
        Cookie: 'foo=123; bar=234',
      },
    });
    const result = getForwardedHeaders(config, request);

    expect(result.get('user-agent')).toBe('simaland-app_name/version');
    expect(result.get('cookie')).toBe('foo=123; bar=234');
  });
});
