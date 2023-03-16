import { createApplication, CURRENT_APP } from '../application';
import { AlreadyBoundError, CircularDependencyError } from '../errors';
import { createPreset } from '../preset';
import { createToken } from '../token';

describe('Application', () => {
  it('should throw exception properly when component not found', () => {
    const TOKEN = {
      config: createToken<any>('config'),
      server: createToken<any>('server'),
      client: createToken<any>('client'),
      logger: createToken<any>('logger'),
    } as const;

    const app = createApplication();
    const spy = jest.fn();

    app.bind(TOKEN.config).toProvider(() => {
      spy();
      return { type: 'config' };
    });

    app.bind(TOKEN.logger).toProvider(resolve => {
      const config = resolve(TOKEN.config);
      return { type: 'logger', config };
    });

    app.bind(TOKEN.client).toProvider(resolve => {
      const logger = resolve(TOKEN.logger);
      return { type: 'client', logger };
    });

    expect(() => {
      app.get(TOKEN.server);
    }).toThrow('Nothing bound to Token(server)');
  });

  it('should bound itself to known token', () => {
    const app = createApplication();

    expect(app.get(CURRENT_APP)).toBe(app);
  });

  it('bind() should return binding with .toValue() method', () => {
    const token = createToken<any>('foo');
    const app = createApplication();
    const component = { count: 10 };

    app.bind(token).toValue(component);

    expect(app.get(token)).toBe(component);
  });

  it('should prevent second binding to same token', () => {
    const token = createToken<number>('age');
    const app = createApplication();

    expect(() => {
      app.bind(token).toValue(23);
    }).not.toThrow();

    expect(() => {
      app.bind(token).toValue(34);
    }).toThrow(new AlreadyBoundError(token, 'Application'));
  });

  it('should handle presets', () => {
    const TOKEN = {
      admin: createToken<{ role: 'admin'; rule: { for: string } }>('rules'),
      rules: createToken<Array<{ for: string }>>('admin'),
    };

    const adminPreset = createPreset([
      [
        TOKEN.admin,
        resolve => {
          const rules = resolve(TOKEN.rules);

          return {
            role: 'admin',
            rule: rules.find(r => r.for === 'admin'),
          };
        },
      ],
    ]);

    const rulesPreset = createPreset([
      [TOKEN.rules, () => [{ for: 'admin' }, { for: 'user' }, { for: 'guest' }]],
    ]);

    const app = createApplication();

    app.preset(adminPreset);
    app.preset(rulesPreset);

    expect(app.get(TOKEN.admin)).toEqual({
      role: 'admin',
      rule: { for: 'admin' },
    });
  });

  it('should handle parent app attach', () => {
    const TOKEN = {
      config: createToken<{ port: number }>('config'),
      server: createToken<{ start: VoidFunction }>('server'),
    };

    const parentApp = createApplication();
    const childApp = createApplication();
    const spy = jest.fn();

    childApp.attach(parentApp);

    childApp.bind(TOKEN.server).toProvider(resolve => {
      const config = resolve(TOKEN.config);

      return {
        start() {
          spy(config.port);
        },
      };
    });

    parentApp.bind(TOKEN.config).toValue({ port: 1200 });

    const server = childApp.get(TOKEN.server);

    expect(spy).toBeCalledTimes(0);
    server.start();
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(1200);
  });

  it('should prevent reattach', () => {
    const parentApp = createApplication();
    const childApp = createApplication();
    const otherApp = createApplication();

    childApp.attach(parentApp);

    // other app reattach
    expect(() => {
      childApp.attach(otherApp);
    }).toThrow(Error('Cannot reattach application'));

    // same app reattach
    expect(() => {
      childApp.attach(parentApp);
    }).toThrow(Error('Cannot reattach application'));
  });

  it('invoke() should works properly', () => {
    const TOKEN = {
      sword: createToken<{ sharpness: number }>('sword'),
      knight: createToken<{ power: number; attack: () => number }>('knight'),
    } as const;

    const app = createApplication();

    app.bind(TOKEN.knight).toProvider(resolve => {
      const weapon = resolve(TOKEN.sword);

      return {
        power: 12,

        attack() {
          return weapon.sharpness + this.power;
        },
      };
    });

    app.bind(TOKEN.sword).toValue({ sharpness: 5 });

    const spy = jest.fn();

    app.invoke([TOKEN.knight], knight => {
      spy(knight.attack());
    });

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(17);
  });

  it('should properly handle circular dependencies', () => {
    const TOKEN = {
      config: createToken<any>('config'),
      logger: createToken<any>('logger'),
    } as const;

    const app = createApplication();

    app.bind(TOKEN.config).toProvider(resolve => {
      const logger = resolve(TOKEN.logger);

      logger.info('Config created');

      return {
        appName: 'test app',
      };
    });

    app.bind(TOKEN.logger).toProvider(resolve => {
      const config = resolve(TOKEN.config);

      return {
        info(message: any) {
          // eslint-disable-next-line no-console
          console.log(config.appName, message);
        },
      };
    });

    expect(() => app.get(TOKEN.config)).toThrow(
      new CircularDependencyError([TOKEN.config, TOKEN.logger, TOKEN.config], 'Application'),
    );
  });

  it('should throw exception properly when component not found in parent app too', () => {
    const TOKEN = {
      config: createToken<any>('config'),
      client: createToken<any>('client'),
      logger: createToken<any>('logger'),
    } as const;

    const parent = createApplication();
    const child = createApplication();
    child.attach(parent);

    child.bind(TOKEN.logger).toProvider(resolve => {
      const config = resolve(TOKEN.config);
      return { type: 'logger', config };
    });

    child.bind(TOKEN.client).toProvider(resolve => {
      const logger = resolve(TOKEN.logger);
      return { type: 'client', logger };
    });

    expect(() => {
      child.get(TOKEN.client);
    }).toThrow('Nothing bound to Token(config)');
  });

  it('should get component from cache', () => {
    const app = createApplication();
    const token = createToken<{ id: number }>('foo');

    const value = { id: 123 };
    app.bind(token).toValue(value);

    const first = app.get(token);
    const second = app.get(token);

    expect(Object.is(value, first)).toBe(true);
    expect(Object.is(value, second)).toBe(true);
    expect(Object.is(first, second)).toBe(true);
  });
});
