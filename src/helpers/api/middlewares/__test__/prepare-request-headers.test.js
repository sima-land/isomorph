import { prepareRequestHeaders } from '../prepare-request-headers';
import { getCookie, getXClientIp } from '../../../http/request-getters';
import { getServiceHeaders, getServiceUserAgent } from '../helpers';

jest.mock('../../../http/request-getters', () => {
  const original = jest.requireActual('../../../http/request-getters');
  return {
    ...original,
    __esModule: true,
    getXClientIp: jest.fn().mockReturnValue('ip'),
    getCookie: jest.fn().mockReturnValue('cookie'),
  };
});

jest.mock('../helpers', () => {
  const original = jest.requireActual('../helpers');
  return {
    ...original,
    __esModule: true,
    getServiceHeaders: jest.fn().mockReturnValue({ 'Simaland-Headers': 'test', 'Simaland-Params': 'test' }),
    getServiceUserAgent: jest.fn().mockReturnValue('UserAgent'),
  };
});

describe('prepareRequestHeaders', () => {
  it('should create header object', () => {
    const request = { test: 'test_request' };
    const config = { test: 'test_config' };
    expect(prepareRequestHeaders({ request, config })).toEqual({
      'X-Client-Ip': 'ip',
      'User-Agent': 'UserAgent',
      Cookie: 'cookie',
      'Simaland-Headers': 'test',
      'Simaland-Params': 'test',
    });
    expect(getXClientIp).toBeCalledWith({ request });
    expect(getCookie).toBeCalledWith(request);
    expect(getServiceHeaders).toBeCalledWith(request);
    expect(getServiceUserAgent).toBeCalledWith(config);
  });

  it('should exclude headers', () => {
    const request = { test: 'test_request' };
    const config = { test: 'test_config' };
    expect(prepareRequestHeaders({ request, config, exclude: ['Simaland-Params'] })).toEqual({
      'X-Client-Ip': 'ip',
      'User-Agent': 'UserAgent',
      Cookie: 'cookie',
      'Simaland-Headers': 'test',
    });
  });
});
