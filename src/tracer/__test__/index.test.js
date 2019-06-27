import { getTracer, traceIncomingRequest } from '..';
import { initTracerFromEnv, tracer } from '../../../__mocks__/jaeger-client';
import { FORMAT_HTTP_HEADERS } from 'opentracing';

describe('getTracer()', () => {
  let instance;
  const config = {};
  const metrics = {};
  const logger = {};
  it('at first time creates tracer instance', () => {
    instance = getTracer({ config, metrics, logger });
    expect(initTracerFromEnv).toHaveBeenCalledTimes(1);
    expect(instance).toEqual(tracer);
  });
  it('returns same tracer instance', () => {
    const sameInstance = getTracer({ config, metrics, logger });
    expect(initTracerFromEnv).toHaveBeenCalledTimes(1);
    expect(sameInstance).toEqual(tracer);
  });
});

describe('traceIncomingRequest()', () => {
  it('traceIncomingRequest() calls method tracer.startSpan', () => {
    const httpRequest = { headers: 1 };
    traceIncomingRequest(tracer, 'key', httpRequest);
    expect(tracer.startSpan).toHaveBeenCalledTimes(1);
    expect(tracer.startSpan).toHaveBeenCalledWith('key', {});
    expect(tracer.extract).toHaveBeenCalledTimes(1);
    expect(tracer.extract).toHaveBeenCalledWith(FORMAT_HTTP_HEADERS, 1);
  });
});
