import { ServerMiddleware } from '../../types';
import { applyServerMiddleware } from '../apply-server-middleware';

describe('applyServerMiddleware', () => {
  it('should compose middleware', async () => {
    const log: string[] = [];

    const foo: ServerMiddleware = async (request, next) => {
      log.push('<foo>');
      const result = await next(request);
      log.push('</foo>');
      return result;
    };

    const bar: ServerMiddleware = async (request, next) => {
      log.push('<bar>');
      const result = await next(request);
      log.push('</bar>');
      return result;
    };

    const baz: ServerMiddleware = async (request, next) => {
      log.push('<baz>');
      const result = await next(request);
      log.push('</baz>');
      return result;
    };

    const enhancer = applyServerMiddleware(foo, bar, baz);

    const handler = enhancer(() => {
      log.push('<handler />');
      return new Response('Test');
    });

    await handler(new Request('http://test.com'), { events: new EventTarget() });

    expect(log).toEqual([
      // expected log
      '<foo>',
      '<bar>',
      '<baz>',
      '<handler />',
      '</baz>',
      '</bar>',
      '</foo>',
    ]);
  });
});
