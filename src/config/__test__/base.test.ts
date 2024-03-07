import { createBaseConfig } from '../base';
import { createConfigSource } from '../source';

describe('createBaseConfig', () => {
  it('should works properly', () => {
    const source = createConfigSource({
      NODE_ENV: 'tests',
      APP_NAME: 'foobar',
      APP_VERSION: 'good',
    });

    const config = createBaseConfig(source);

    expect(config).toEqual({
      env: 'tests',
      appName: 'foobar',
      appVersion: 'good',
    });
  });
});
