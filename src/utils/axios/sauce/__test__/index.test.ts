import axios from 'axios';
import { sauce, formatResultInfo } from '..';

describe('sauce', () => {
  it('should return axios like object', () => {
    const result = sauce(axios.create());

    expect(typeof result.request === 'function').toBe(true);
    expect(typeof result.get === 'function').toBe(true);
    expect(typeof result.delete === 'function').toBe(true);
    expect(typeof result.head === 'function').toBe(true);
    expect(typeof result.options === 'function').toBe(true);
    expect(typeof result.post === 'function').toBe(true);
    expect(typeof result.put === 'function').toBe(true);
    expect(typeof result.patch === 'function').toBe(true);
  });
});

describe('formatResultInfo', () => {
  it('should return apisauce like formatted object', () => {
    const success = formatResultInfo({
      ok: true,
      result: {
        data: { foo: 'bar' },
        status: 201,
        statusText: 'CREATED',
        config: {} as any,
        headers: {},
      },
    });

    expect(success.ok).toBe(true);
    expect(success.data).toEqual({ foo: 'bar' });
  });

  it('should return apisauce like formatted object when failed', () => {
    const error = new axios.AxiosError('MSG', '500', {} as any, {}, {
      data: { bar: 'baz' },
    } as any);

    const failure = formatResultInfo({
      ok: false,
      error,
    }) as any;

    expect(failure.ok).toBe(false);
    expect(failure.data).toEqual({ bar: 'baz' });
    expect(failure.error).toBe(error);
  });

  it('should return apisauce like formatted object when failed with non axios error', () => {
    const error = new Error('NON AXIOS ERROR');

    const failure = formatResultInfo({
      ok: false,
      error,
    }) as any;

    expect(failure.ok).toBe(false);
    expect(failure.data).toBe(undefined);
    expect(failure.error).toBe(error);
  });
});
