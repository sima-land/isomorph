import { FetchUtil } from '../../../../http';
import { Breadcrumb, DetailedError, createLogger } from '../../../../log';
import { FetchLogging } from '../fetch-logging';

describe('FetchLogging', () => {
  it('methods should do nothing when disabled', () => {
    const spy = jest.fn();
    const logger = createLogger();
    const handler = new FetchLogging(logger);

    logger.subscribe(spy);
    handler.disabled = true;

    expect(spy).toHaveBeenCalledTimes(0);

    handler.onRequest({
      request: new Request('https://test.com'),
    });

    expect(spy).toHaveBeenCalledTimes(0);

    handler.onResponse({
      request: new Request('https://test.com'),
      response: new Response('foobar'),
    });

    expect(spy).toHaveBeenCalledTimes(0);

    handler.onCatch({
      request: new Request('https://test.com'),
      error: new Error('fake error'),
    });

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('onRequest should work properly', () => {
    const spy = jest.fn();
    const logger = createLogger();
    const handler = new FetchLogging(logger);

    logger.subscribe(spy);

    expect(spy).toHaveBeenCalledTimes(0);

    handler.onRequest({
      request: new Request(
        FetchUtil.withParams('https://test.com', {
          foo: 'bar',
        }),
        { method: 'GET' },
      ),
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toEqual({
      type: 'info',
      data: new Breadcrumb({
        category: 'http.request',
        type: 'http',
        data: {
          url: 'https://test.com/',
          method: 'GET',
          params: { foo: 'bar' },
        },
        level: 'info',
      }),
    });
  });

  it('onResponse should work properly', () => {
    const spy = jest.fn();
    const logger = createLogger();
    const handler = new FetchLogging(logger);

    logger.subscribe(spy);

    expect(spy).toHaveBeenCalledTimes(0);

    handler.onResponse({
      request: new Request(
        FetchUtil.withParams('https://test.com', {
          foo: 'bar',
        }),
        { method: 'GET' },
      ),
      response: new Response('', { status: 201 }),
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toEqual({
      type: 'info',
      data: new Breadcrumb({
        category: 'http.response',
        type: 'http',
        data: {
          url: 'https://test.com/',
          method: 'GET',
          params: { foo: 'bar' },
          status_code: 201,
        },
        level: 'info',
      }),
    });
  });

  it('onResponse should handles "ok" property', () => {
    const spy = jest.fn();
    const logger = createLogger();
    const handler = new FetchLogging(logger);

    logger.subscribe(spy);

    expect(spy).toHaveBeenCalledTimes(0);

    handler.onResponse({
      request: new Request(
        FetchUtil.withParams('https://test.com', {
          foo: 'bar',
        }),
        { method: 'GET' },
      ),
      response: new Response('', { status: 500 }),
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toEqual({
      type: 'info',
      data: new Breadcrumb({
        category: 'http.response',
        type: 'http',
        data: {
          url: 'https://test.com/',
          method: 'GET',
          params: { foo: 'bar' },
          status_code: 500,
        },
        level: 'error',
      }),
    });
  });

  it('onCatch should work properly', () => {
    const spy = jest.fn();
    const logger = createLogger();
    const handler = new FetchLogging(logger);

    logger.subscribe(spy);

    expect(spy).toHaveBeenCalledTimes(0);

    handler.onCatch({
      request: new Request(
        FetchUtil.withParams('https://test.com', {
          foo: 'bar',
        }),
        { method: 'GET' },
      ),
      error: new Error('Test error'),
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toEqual({
      type: 'error',
      data: new DetailedError('Error: Test error', {
        level: 'error',
        context: [
          {
            key: 'Outgoing request details',
            data: {
              url: 'https://test.com',
              method: 'GET',
              params: { foo: 'bar' },
            },
          },
        ],
      }),
    });
  });
});
