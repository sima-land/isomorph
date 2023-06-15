import { createToken } from '../token';

describe('Token implementation', () => {
  it('_resolve() should works properly', () => {
    const token = createToken();
    const registry = new Map<symbol, any>();
    const component = { type: 'some component' };

    registry.set(token._key, component);

    expect(token._resolve(registry)).toBe(component);
  });

  it('toString() should works properly', () => {
    const token = createToken('hello');

    expect(String(token)).toBe('Token(hello)');
  });

  it('toString() should works properly for unnamed token', () => {
    const token = createToken();

    expect(String(token)).toBe('Token(unknown)');
  });
});
