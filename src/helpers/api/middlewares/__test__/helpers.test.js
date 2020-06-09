import { getServiceUserAgent, getServiceHeaders } from '../helpers';

describe('getServiceHeaders', () => {
  it('should return correct headers', () => {
    expect(getServiceHeaders({
      headers: {
        cookie: 'test',
        'Simaland-test-header': 'test',
        host: 'test',
        'simaland-other-test-header': 'test',
        'Test-Simaland-Header': 'test',
      },
    })).toEqual({
      'Simaland-test-header': 'test',
      'simaland-other-test-header': 'test',
    });
  });

  it('should return empty object', () => {
    expect(getServiceHeaders()).toEqual({});
    expect(getServiceHeaders({})).toEqual({});
    expect(getServiceHeaders(null)).toEqual({});
  });
});

describe('getServiceUserAgent', () => {
  it('should return UserAgent', () => {
    expect(getServiceUserAgent({
      serviceName: 'testServiceName',
      version: 'testVersion',
    })).toEqual('simaland-testServiceName/testVersion');
  });

  it('should return empty string when some options is empty', () => {
    expect(getServiceUserAgent({
      serviceName: 'testServiceName',
    })).toEqual('');
  });

  it('should return empty string without options', () => {
    expect(getServiceUserAgent({})).toEqual('');
    expect(getServiceUserAgent()).toEqual('');
  });
});
