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

    it('should create all spans', async () => {
      const child = { childOf: 'test' };
      await instance(requestConfig, next);
      expect(tracer.startSpan).toBeCalledTimes(size(omit(REQUEST_STAGES, 'end')));
      expect(tracer.startSpan).toHaveBeenNthCalledWith(1, '', child);
      expect(tracer.startSpan).toHaveBeenNthCalledWith(2, '', child);
      expect(tracer.startSpan).toHaveBeenNthCalledWith(3, '', child);
      expect(tracer.startSpan).toHaveBeenNthCalledWith(4, '', child);
      expect(tracer.startSpan).toHaveBeenNthCalledWith(5, '', child);

      expect(testSpan.setOperationName).toHaveBeenNthCalledWith(1, 'DNS Lookup');
      expect(testSpan.setOperationName).toHaveBeenNthCalledWith(2, 'TCP Connection');
      expect(testSpan.setOperationName).toHaveBeenNthCalledWith(3, 'TLS Handshake');
      expect(testSpan.setOperationName).toHaveBeenNthCalledWith(4, 'Time to First Byte');
      expect(testSpan.setOperationName).toHaveBeenNthCalledWith(5, 'Data Loading');
    });

    it('should create part spans if not all events has emit', async () => {
      const child = { childOf: 'test' };

      const nextFn = jest.fn(({ emitter }) => {
        emitter.emit(REQUEST_STAGES.start);
        emitter.emit(REQUEST_STAGES.firstByteReceived);
        emitter.emit(REQUEST_STAGES.end);
        return { status: 200 };
      });

      await instance(requestConfig, nextFn);
      expect(tracer.startSpan).toBeCalledTimes(2);
      expect(tracer.startSpan).toHaveBeenNthCalledWith(1, '', child);
      expect(tracer.startSpan).toHaveBeenNthCalledWith(2, '', child);

      expect(testSpan.setOperationName).toHaveBeenNthCalledWith(1, 'Time to First Byte');
      expect(testSpan.setOperationName).toHaveBeenNthCalledWith(2, 'Data Loading');
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
