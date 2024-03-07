import { createConfigSource } from '../source';

describe('createConfigSource', () => {
  beforeEach(() => {
    (globalThis as any).__ISOMORPH_ENV__ = {
      NODE_ENV: 'tests',
    };
  });

  it('should works properly', () => {
    const source = createConfigSource({ EXTRA_VAR: '123' });

    expect(source.get('NODE_ENV')).toBe('tests');
    expect(source.get('EXTRA_VAR')).toBe('123');
  });
});
