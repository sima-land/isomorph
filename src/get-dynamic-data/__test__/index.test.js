import { getDynamicData, getApiLogData } from '../index';

describe('getDynamicData()', () => {
  it('should return data', () => {
    const data = getDynamicData({
      config: {
        version: 'test',
      },
      timeDataKey: 'logData',
    })({
      headers: {
        'x-client-ip': '::1',
      },
      method: 'test method',
      originalUrl: '/testUrl',
    },
    {
      statusCode: 200,
      locals: {
        logData: {
          'sima-land': 200.82,
          gitHub: 300.28,
          gitLab: 666,
        },
      },
    });

    expect(data).toEqual({
      gitHub: 300.28,
      gitLab: 666,
      method: 'test method',
      remote_ip: '::1',
      status: 200,
      route: '/testUrl',
      'sima-land': 200.82,
      version: 'test',
    });
  });
});

describe('getApiLogData', () => {
  const timeDataKey = 'logData';
  it('works correctly with locals.logData', () => {
    const response = {
      locals: {
        logData: 'test',
      },
    };
    const logData = getApiLogData({ response, timeDataKey });

    expect(logData).toBe('test');
  });
  it('works correctly without locals.logData', () => {
    const response = {
      locals: {
        logData: undefined,
      },
    };
    const logData = getApiLogData({ response, timeDataKey });

    expect(logData).toEqual({});
  });
});
