import { StatusError, ResponseError } from '../errors';

describe('StatusError', () => {
  it('should have some properties', () => {
    const response = new Response('Good', { status: 200 });
    const error = new StatusError(response);

    expect(error.name).toBe('StatusError');
    expect(error.message).toBe(`HTTP Request failed with status ${200}`);
    expect(error.response).toBe(response);
  });

  it('static is() should works correctly', () => {
    expect(StatusError.is(new StatusError(new Response('error', { status: 400 })))).toBe(true);
    expect(StatusError.is(123)).toBe(false);
  });
});

describe('ResponseError', () => {
  it('should have some properties', () => {
    const error = new ResponseError('Hello!', 400);

    expect(error.name).toBe('ResponseError');
    expect(error.message).toBe('Hello!');
    expect(error.statusCode).toBe(400);
  });

  it('should handle status missing', () => {
    const error = new ResponseError('Hello!');

    expect(error.name).toBe('ResponseError');
    expect(error.message).toBe('Hello!');
    expect(error.statusCode).toBe(500);
  });

  it('should handle init', () => {
    const error = new ResponseError('Need redirect', {
      statusCode: 301,
      redirectLocation: '/hello.php',
      logLevel: 'debug',
    });

    expect(error.logLevel).toBe('debug');
    expect(error.statusCode).toBe(301);
    expect(error.redirectLocation).toBe('/hello.php');
  });

  it('should handle empty init', () => {
    const error = new ResponseError('Need redirect', {});

    expect(error.logLevel).toBe('error');
    expect(error.statusCode).toBe(500);
    expect(error.redirectLocation).toBe(null);
  });
});
