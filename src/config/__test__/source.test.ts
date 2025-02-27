import { createConfigSource } from '../source';

describe('createConfigSource', () => {
  beforeEach(() => {
    (globalThis as any).__ISOMORPH_ENV__ = {
      APP_NAME: 'test-app',
      NODE_ENV: 'tests',
    };
    (globalThis as any)['test-app__envs'] = {
      PUBLIC_TEST: 'public-tests',
    };
  });

  it('should works properly', () => {
    const source = createConfigSource({ EXTRA_VAR: '123' });

    expect(source.get('NODE_ENV')).toBe('tests');
    expect(source.get('EXTRA_VAR')).toBe('123');
    expect(source.get('PUBLIC_TEST')).toBe('public-tests');
  });
});
