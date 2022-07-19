import { createContainer } from '../container';
import { AlreadyBoundError, CircularDependencyError } from '../errors';
import { createToken } from '../token';

describe('Container', () => {
  it('should prevent second binding to same token', () => {
    const token = createToken<number>('age');
    const container = createContainer();

    expect(() => {
      container.set(token, () => 23);
    }).not.toThrow(new AlreadyBoundError(token));

    expect(() => {
      container.set(token, () => 23);
    }).toThrow(new AlreadyBoundError(token));
  });

  it('should throw type error when provider is not a function', () => {
    const token = createToken<number>('answer');
    const container = createContainer();

    container.set(token, 42 as any);

    expect(() => {
      container.get(token);
    }).toThrow(new Error('Provider is not a function'));
  });

  it('should properly get component from cache', () => {
    const token = createToken<{ id: number; name: string }>('user');
    const container = createContainer();

    container.set(token, () => ({
      id: 1,
      name: 'John',
    }));

    const user1 = container.get(token);
    const user2 = container.get(token);

    expect(user1).toBe(user2);
  });

  it('should provide resolve', () => {
    const TOKEN = {
      foo: createToken<number>('foo'),
      bar: createToken<string>('bar'),
    } as const;

    const container = createContainer();

    container.set(TOKEN.foo, () => 123.45);

    container.set(TOKEN.bar, resolve => {
      const foo = resolve(TOKEN.foo);
      return foo.toString();
    });

    expect(container.get(TOKEN.bar)).toBe('123.45');
  });

  it('should handle circular dependencies', () => {
    const TOKEN = {
      foo: createToken<number>('foo'),
      bar: createToken<string>('bar'),
      baz: createToken<boolean>('baz'),
    } as const;

    const container = createContainer();

    container.set(TOKEN.foo, resolve => {
      const baz = resolve(TOKEN.baz);

      return Number(baz);
    });

    container.set(TOKEN.bar, resolve => {
      const foo = resolve(TOKEN.foo);

      return String(foo + 11);
    });

    container.set(TOKEN.baz, resolve => {
      const bar = resolve(TOKEN.bar);

      return bar.length > 1;
    });

    expect(() => {
      container.get(TOKEN.bar);
    }).toThrow(new CircularDependencyError([TOKEN.bar, TOKEN.foo, TOKEN.baz, TOKEN.bar]));
  });
});
