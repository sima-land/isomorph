import { createApplication } from '../application';
import { createPreset } from '../preset';
import { createToken } from '../token';

describe('Preset', () => {
  it('set() and override() should add providers', () => {
    const preset = createPreset([]);

    const TOKEN = {
      hello: createToken<string>('hello'),
      world: createToken<string>('world'),
    } as const;

    preset.set(TOKEN.hello, () => 'hello');

    const app = createApplication();
    app.preset(preset);

    expect(app.get(TOKEN.hello)).toBe('hello');
    expect(app.get(TOKEN.world)).toBe('world');
  });
});
