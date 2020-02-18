import {
  isStream,
  isEventEmitter,
  prepareDataBuffer,
  createTransport,
  createOptions,
  createConcatURL,
  buildRequestPath,
  uncompressResponse,
} from '../helpers';

import { Readable } from 'stream';
import EventEmitter from 'events';

jest.mock('zlib', () => {
  const original = jest.requireActual('zlib');
  return {
    ...original,
    createUnzip: jest.fn().mockReturnValue('testUnzip'),
  };
});

describe('isStream()', () => {
  const stream = new Readable();
  it('should return true', () => {
    expect(isStream(stream)).toBeTruthy();
  });

  it('should return false', () => {
    expect(isStream({})).toBeFalsy();
    expect(isStream('test')).toBeFalsy();
    expect(isStream(null)).toBeFalsy();
    expect(isStream(undefined)).toBeFalsy();
  });
});

describe('isEventEmitter()', () => {
  const ee = new EventEmitter();
  it('should return true', () => {
    expect(isEventEmitter(ee)).toBeTruthy();
  });

  it('should return false', () => {
    expect(isEventEmitter({})).toBeFalsy();
    expect(isEventEmitter('test')).toBeFalsy();
    expect(isEventEmitter(null)).toBeFalsy();
    expect(isEventEmitter(undefined)).toBeFalsy();
  });
});

describe('prepareDataBuffer()', () => {
  it('should return instance of Buffer for buffer, arrayBuffer, string', () => {
    const buff = new Buffer.from('test');
    const arrBuff = new ArrayBuffer(10);
    expect(prepareDataBuffer(buff)).toBeInstanceOf(Buffer);
    expect(prepareDataBuffer(arrBuff)).toBeInstanceOf(Buffer);
    expect(prepareDataBuffer('test')).toBeInstanceOf(Buffer);
  });

  it('should return undefined for other types', () => {
    expect(prepareDataBuffer()).not.toBeDefined();
    expect(prepareDataBuffer({})).not.toBeDefined();
    expect(prepareDataBuffer(123)).not.toBeDefined();
    expect(prepareDataBuffer(null)).not.toBeDefined();
    expect(prepareDataBuffer(new Readable())).not.toBeDefined();
  });
});

describe('createConcatURL()', () => {
  it('should create correct URL obj', () => {
    expect(createConcatURL('/a/b/c/', 'https://example.com').href)
      .toEqual('https://example.com/a/b/c/');
    expect(createConcatURL('/d/e/f/', 'https://example.com/a/b/c').href)
      .toEqual('https://example.com/a/b/c/d/e/f/');
    expect(createConcatURL('d/e/f/', 'https://example.com/a/b/c').href)
      .toEqual('https://example.com/a/b/c/d/e/f/');
    expect(createConcatURL('a/b/c/', 'https://example.com').href)
      .toEqual('https://example.com/a/b/c/');
    expect(createConcatURL('/a/b/c', 'https://example.com').href)
      .toEqual('https://example.com/a/b/c');
    expect(createConcatURL('https://example.com/a/b/c', 'https://test.com').href)
      .toEqual('https://example.com/a/b/c');
    expect(createConcatURL('https://example.com/a/b/c').href)
      .toEqual('https://example.com/a/b/c');
    expect(createConcatURL('', 'https://example.com/a/b/c').href)
      .toEqual('https://example.com/a/b/c/');
  });
});

describe('createTransport()', () => {
  it('should return correct transport for both protocols without redirects', () => {
    const config = {
      url: 'a/b/c/',
      maxRedirects: 0,
    };
    expect(createTransport({ ...config, baseURL: 'https://example.com' })).toBe(require('https'));
    expect(createTransport({ ...config, baseURL: 'http://example.com' })).toBe(require('http'));
  });

  it('should return correct transport for both protocols with redirects', () => {
    const config = {
      url: 'a/b/c/',
      maxRedirects: 10,
    };
    expect(createTransport({ ...config, baseURL: 'https://example.com' })).toBe(require('follow-redirects').https);
    expect(createTransport({ ...config, baseURL: 'http://example.com' })).toBe(require('follow-redirects').http);
  });

  it('should return correct transport for external transport prop', () => {
    const config = {
      url: 'a/b/c/',
      maxRedirects: 10,
      transport: 'test',
    };
    expect(createTransport({ ...config, baseURL: 'https://example.com' })).toBe(config.transport);
    expect(createTransport({ ...config, baseURL: 'http://example.com' })).toBe(config.transport);
  });

  it('should return correct transport for absolute path url', () => {
    const config = {
      url: 'http://example.com',
      baseURL: 'https://example.com',
      maxRedirects: 0,
    };
    expect(createTransport(config)).toBe(require('http'));
  });

  it('should return http transport for bad protocol', () => {
    const config = {
      url: 'a/b/c/',
      baseURL: 'ftp://example.com',
      maxRedirects: 0,
    };
    expect(createTransport(config)).toBe(require('http'));
    expect(createTransport({ ...config, maxRedirects: 10 })).toBe(require('follow-redirects').http);
  });
});

describe('createOptions()', () => {
  const config = {
    url: 'a/b/c',
    baseURL: 'https://example.com',
    method: 'get',
    headers: 'test',
    httpAgent: 'httpAgent',
    httpsAgent: 'httpsAgent',
    params: {
      foo: 'bar',
    },
  };
  it('should create options object correctly for various params', () => {
    expect(createOptions(config)).toEqual({
      path: '/a/b/c?foo=bar',
      method: 'GET',
      agents: { http: 'httpAgent', https: 'httpsAgent' },
      headers: 'test',
      agent: 'httpsAgent',
      hostname: 'example.com',
    });

    expect(createOptions({
      ...config,
      baseURL: 'http://example.com:888/',
      maxRedirects: 10,
      maxContentLength: 100,
    })).toEqual({
      path: '/a/b/c?foo=bar',
      method: 'GET',
      agents: { http: 'httpAgent', https: 'httpsAgent' },
      headers: 'test',
      agent: 'httpAgent',
      hostname: 'example.com',
      maxRedirects: 10,
      maxBodyLength: 100,
      port: 888,
    });
  });
});

describe('buildRequestPath()', () => {
  it('should return correctly for empty params', () => {
    expect(buildRequestPath(new URL('https://example.com'))).toEqual('/');
    expect(buildRequestPath(new URL('https://example.com/'))).toEqual('/');
    expect(buildRequestPath(new URL('https://example.com/a/b/c/'))).toEqual('/a/b/c/');
  });

  it('should return correctly with inline params', () => {
    expect(buildRequestPath(new URL('https://example.com/?a=b&c=d'))).toEqual('/?a=b&c=d');
    expect(buildRequestPath(new URL('https://example.com/a/b/c/?a=b&c=d'))).toEqual('/a/b/c/?a=b&c=d');
  });

  it('should return correctly with outline params', () => {
    expect(buildRequestPath(new URL('https://example.com'), { e: 'f', g: 'h' }))
      .toEqual('/?e=f&g=h');
    expect(buildRequestPath(new URL('https://example.com/a/b/c'), { e: 'f', g: 'h' }))
      .toEqual('/a/b/c?e=f&g=h');
  });

  it('should return correctly with inline and outline params', () => {
    expect(buildRequestPath(new URL('https://example.com/?a=b&c=d'), { e: 'f', g: 'h' }))
      .toEqual('/?a=b&c=d&e=f&g=h');
    expect(buildRequestPath(new URL('https://example.com/a/b/c/?a=b&c=d'), { e: 'f', g: 'h' }))
      .toEqual('/a/b/c/?a=b&c=d&e=f&g=h');
  });

  it('should return correctly with custom paramsSerializer', () => {
    expect(buildRequestPath(
      new URL('https://example.com'),
      { e: 'f', g: 'h' },
      params => Object.entries(params).map(item => item.join('=')).join('&')
    )).toEqual('/?e=f&g=h');
  });
});

describe('uncompressResponse()', () => {
  const spy = jest.fn();
  it('should return uncompress data', () => {
    const res = {
      headers: {
        'content-encoding': 'compress',
      },
      pipe: spy,
    };
    uncompressResponse(res);
    expect(spy).toBeCalledWith('testUnzip');
  });

  it('should return data without changes with `no content` code', () => {
    const res = {
      headers: {
        'content-encoding': 'compress',
      },
      statusCode: 204,
      pipe: spy,
    };
    expect(uncompressResponse(res)).toBe(res);
  });

  it('should return data without changes if response without compress headers', () => {
    const res = {
      headers: {},
      statusCode: 204,
      pipe: spy,
    };
    expect(uncompressResponse(res)).toBe(res);
  });
});
