import { createRedisCache } from '../redis';
import { mockSet } from '../../../__mocks__/ioredis';
import { mapServiceOptionsToArgs, wrapInTrace } from '../wrap-in-trace';
import { getTracer } from '../../helpers/tracer';

describe('wrapInTrace()', () => {
  it('wrapInTrace methods works properly', () => {
    const context = 'test';
    const config = {
      redisEnabled: true,
    };
    const tracer = getTracer({
      config: {},
    });
    const cache = createRedisCache(config);
    const wrapTrace = wrapInTrace(tracer, context, cache);
    wrapTrace.set('testKey', 'testValue');
    expect(mockSet).toBeCalledTimes(1);
    expect(wrapTrace.status).toBe(null);
  });
  it('spanFinish is working', async () => {
    const spy = jest.fn();
    const tracer = {
      startSpan: () => ({
        finish: spy,
      }),
    };
    const context = 'test';
    const cache = {
      get: () => new Promise(resolve => resolve()),
    };
    const wrapTrace = wrapInTrace(tracer, context, cache);
    expect(spy).toHaveBeenCalledTimes(0);
    await wrapTrace.get();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('mapServiceOptionsToArgs()', () => {
  const cache = {
    cacheConfig: 'test',
    redisHost: 'foo',
  };
  const tracer = 'tracer';
  it('mapServiceOptionsToArgs() works properly', () => {
    const context = 'test';
    expect(mapServiceOptionsToArgs({ tracer, context, cache })).toEqual([
      'tracer',
      'test',
      {
        cacheConfig: 'test',
        redisHost: 'foo',
      },
    ]);
  });
  it('mapServiceOptionsToArgs() works without context', () => {
    expect(mapServiceOptionsToArgs({ tracer, cache })).toEqual([
      'tracer',
      {},
      {
        cacheConfig: 'test',
        redisHost: 'foo',
      },
    ]);
  });
});
