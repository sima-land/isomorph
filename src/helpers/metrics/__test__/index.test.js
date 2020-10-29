import { createResponseEventSubscriber, labelsResolver } from '../index';
import { EventEmitter } from 'events';

describe('labelsResolver', () => {
  it('resolves labels data without place data correctly', () => {
    const result = labelsResolver({
      dependencies: { config: {} },
      request: {
        path: '/',
        baseUrl: '/test',
        method: 'GET',
      },
      response: { statusCode: 200 },
    });
    expect(result).toEqual({
      version: 'development',
      route: '/test/',
      code: 200,
      method: 'GET',
    });
  });
  it('resolves labels data with passed place data correctly', () => {
    const result = labelsResolver({
      dependencies: { config: { place: 'test-place' } },
      request: {
        path: '/',
        baseUrl: '/test',
        method: 'GET',
      },
      response: { statusCode: 400 },
    });
    expect(result).toEqual({
      version: 'development',
      route: '/test/',
      code: 400,
      method: 'GET',
    });
  });
});

describe('createResponseEventSubscriber', () => {
  it('creates subscriber correctly', () => {
    const subscriber = createResponseEventSubscriber('some-test-event');
    expect(subscriber).toBeInstanceOf(Function);
    expect(subscriber).toHaveLength(1);
  });
  it('creates a subscriber, which subscribes the callback passed to the event type passed', () => {
    const subscriber = createResponseEventSubscriber('another-test-event');
    const callback = jest.fn();
    const response = new EventEmitter();
    subscriber({ callback, response });
    expect(callback).not.toHaveBeenCalled();
    response.emit('another-test-event');
    expect(callback).toHaveBeenCalledTimes(1);
    response.emit('another-test-event');
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
