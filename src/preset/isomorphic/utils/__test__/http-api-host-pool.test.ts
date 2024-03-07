import { createConfigSource } from '../../../../config';
import { HttpApiHostPool } from '../http-api-host-pool';

describe('HttpApiHostPool', () => {
  it('.get() should return value from map', () => {
    const source = createConfigSource({
      API_FOO: 'http://www.foo.com',
      API_BAR: 'http://www.bar.com',
    });

    const pool = new HttpApiHostPool({ foo: 'API_FOO', bar: 'API_BAR' }, source);

    expect(pool.get('foo')).toBe('http://www.foo.com');
    expect(pool.get('bar')).toBe('http://www.bar.com');
  });

  it('.get() should throw error when variable name is undefined', () => {
    const source = createConfigSource({
      API_FOO: 'http://www.foo.com',
    });

    const pool = new HttpApiHostPool({ foo: 'API_FOO' }, source);

    expect(pool.get('foo')).toBe('http://www.foo.com');

    expect(() => {
      pool.get('bar' as any);
    }).toThrow(`Known HTTP API not found by key "bar"`);
  });

  it('should handle absolute option', () => {
    const source = createConfigSource({
      API_HOST_FOOBAR: 'http://www.foobar.com',
    });

    const pool = new HttpApiHostPool(
      {
        foobar: 'API_HOST_FOOBAR',
      },
      source,
    );

    expect(pool.get('foobar', { absolute: true })).toEqual('http://www.foobar.com');
  });

  it('getAll() should return all hosts', () => {
    const source = createConfigSource({
      API_HOST_FOO: 'http://www.foo.com',
      API_HOST_BAR: 'http://www.bar.com',
      API_HOST_BAZ: 'http://www.baz.com',
    });

    const pool = new HttpApiHostPool(
      {
        foo: 'API_HOST_FOO',
        bar: 'API_HOST_BAR',
        baz: 'API_HOST_BAZ',
      },
      source,
    );

    expect(pool.getAll()).toEqual({
      foo: 'http://www.foo.com',
      bar: 'http://www.bar.com',
      baz: 'http://www.baz.com',
    });
  });

  it('getAll(keys) should return hosts for keys', () => {
    const source = createConfigSource({
      API_HOST_FOO: 'http://www.foo.com',
      API_HOST_BAR: 'http://www.bar.com',
      API_HOST_BAZ: 'http://www.baz.com',
    });

    const pool = new HttpApiHostPool(
      {
        foo: 'API_HOST_FOO',
        bar: 'API_HOST_BAR',
        baz: 'API_HOST_BAZ',
      },
      source,
    );

    expect(pool.getAll(['foo', 'baz'])).toEqual({
      foo: 'http://www.foo.com',
      baz: 'http://www.baz.com',
    });
  });
});
