import { createToken } from '../token';

describe('Token implementation', () => {
  it('method _resolve() should works properly', () => {
    const token = createToken();
    const registry = new Map<symbol, any>();
    const component = { type: 'some component' };

    registry.set(token._key, component);

    expect(token._resolve(registry)).toBe(component);
  });

  it('method toString() should works properly', () => {
    const token = createToken('hello');

    expect(String(token)).toBe('Token(hello)');
  });
});
