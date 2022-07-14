import { createApplication } from '../application';
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

  // @todo Проверка рекурсии не работает, надо починить и зафиксировать тестами
  // it('should throw exception properly when circular dependency found', () => {
  //   const TOKEN = {
  //     server: createToken<any>('server'),
  //     client: createToken<any>('client'),
  //   } as const;

  //   const app = createApplication();

  //   app.bind(TOKEN.server).toProvider(resolve => {
  //     resolve(TOKEN.client);
  //     return { type: 'server' };
  //   });

  //   app.bind(TOKEN.client).toProvider(resolve => {
  //     resolve(TOKEN.server);
  //     return { type: 'client' };
  //   });

  //   expect(() => {
  //     app.get(TOKEN.server);
  //   }).toThrow('sfgasfasf');
  // });

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
});
