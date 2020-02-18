import createStagesTraceRequestMiddleware, { StageRequestEmitter } from '../stages-trace-middleware';
import { tracer, testSpan } from '../../../../../__mocks__/jaeger-client';
import { REQUEST_STAGES } from '../../server-adapter/constants';
import omit from 'lodash/omit';
import size from 'lodash/size';

describe('createStagesTraceRequestMiddleware()', () => {
  it('creates middleware for tracing stages of request', () => {
    expect(createStagesTraceRequestMiddleware({})).toBeInstanceOf(Function);
  });

  describe('middleware', () => {
    const next = jest.fn(({ emitter }) => {
      emitter.eventNames().map(name => emitter.emit(name));
      return { status: 200 };
    });
    const requestConfig = {
      baseURL: 'https://example.com',
      url: '/a/b',
      headers: {
        tracerId: 'test',
      },
    };
    const instance = createStagesTraceRequestMiddleware({ tracer });
    it('should create emitter and register listeners', () => {
      instance(requestConfig, next);
      expect(next.mock.calls[0][0].emitter).toBeInstanceOf(StageRequestEmitter);
      expect(next.mock.calls[0][0].emitter.eventNames()).toEqual(Object.values(REQUEST_STAGES));
    });

    it('should create spans', async () => {
      const child = { childOf: 'test' };
      await instance(requestConfig, next);
      expect(tracer.startSpan).toBeCalledTimes(size(omit(REQUEST_STAGES, 'end')));
      expect(tracer.startSpan).toHaveBeenNthCalledWith(1, 'DNS Lookup', child);
      expect(tracer.startSpan).toHaveBeenNthCalledWith(2, 'TCP Connection', child);
      expect(tracer.startSpan).toHaveBeenNthCalledWith(3, 'TLS Handshake', child);
      expect(tracer.startSpan).toHaveBeenNthCalledWith(4, 'Time to First Byte', child);
      expect(tracer.startSpan).toHaveBeenNthCalledWith(5, 'Data Loading', child);
    });

    it('should finish span', async () => {
      await instance(requestConfig, next);
      expect(testSpan.finish).toBeCalledTimes(size(omit(REQUEST_STAGES, 'start')));
    });

    it('should remove listeners after sending request', async () => {
      await instance(requestConfig, next);
      expect(next.mock.calls[0][0].emitter.eventNames()).toHaveLength(0);
    });
  });
});
