import type express from 'express';
import type { BaseConfig } from '../../../../config';
import { getForwardedHeaders } from '../get-forwarded-headers';

describe('getForwardedHeaders', () => {
  it('should return headers', () => {
    const config: BaseConfig = {
      appName: 'foo',
      appVersion: '0.0.1',
      env: 'test',
    };

    const request: express.Request = {
      socket: {
        remoteAddress: '127.0.0.1',
      },
      headers: {
        cookie: 'userid=12345',
        'simaland-a': 'aaa',
        'simaland-b': 'bbb',
      },
      get(key: string) {
        return this.headers[key];
      },
      header(key: string) {
        return this.headers[key];
      },
    } as any;

    const result = getForwardedHeaders(config, request);

    expect(result).toEqual({
      'X-Client-Ip': '127.0.0.1',
      'User-Agent': `simaland-foo/0.0.1`,
      Cookie: 'userid=12345',
      'simaland-a': 'aaa',
      'simaland-b': 'bbb',
    });
  });

  it('should return headers when lot of data is undefined', () => {
    const config: BaseConfig = {
      appName: 'foo',
      appVersion: '0.0.1',
      env: 'test',
    };

    const request: express.Request = {
      socket: {
        remoteAddress: undefined,
      },
      headers: {},
      get(key: string) {
        return this.headers[key];
      },
      header(key: string) {
        return this.headers[key];
      },
    } as any;

    const result = getForwardedHeaders(config, request);

    expect(result).toEqual({
      'User-Agent': `simaland-foo/0.0.1`,
    });
  });
});
