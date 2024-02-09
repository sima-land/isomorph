import { TOKEN } from '../tokens';
import { AppConfig } from './types';
import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetNode, HandlerProvider } from '@sima-land/isomorph/preset/node';
import { AuthorsPageApp } from '../pages/authors';
import { PostsPageApp } from '../pages/posts';
import express from 'express';

export function MainApp() {
  const app = createApplication();

  // используем пресет "node" с базовыми компонентами, такими как logger и тд
  app.preset(PresetNode());

  // добавляем в приложение собственные компоненты
  app.bind(TOKEN.config).toProvider(provideAppConfig);
  app.bind(TOKEN.server).toProvider(provideHttpServer);
  app.bind(TOKEN.Pages.posts).toProvider(HandlerProvider(PostsPageApp));
  app.bind(TOKEN.Pages.authors).toProvider(HandlerProvider(AuthorsPageApp));

  return app;
}

function provideAppConfig(resolve: Resolve): AppConfig {
  const source = resolve(TOKEN.Lib.Config.source);
  const base = resolve(TOKEN.Lib.Config.base);

  return {
    ...base,
    http: {
      ports: {
        main: Number(source.require('MAIN_HTTP_PORT')) || -1,
        metrics: Number(source.require('METRICS_HTTP_PORT')) || -1,
      },
    },
  };
}

function provideHttpServer(resolve: Resolve): express.Application {
  const postsHandler = resolve(TOKEN.Pages.posts);
  const authorsHandler = resolve(TOKEN.Pages.authors);
  const healthCheckHandler = resolve(TOKEN.Lib.Express.Handlers.healthCheck);

  // промежуточные слои (express) доступные из пресета PresetNode
  const requestHandle = resolve(TOKEN.Lib.Express.Middleware.request);
  const logging = resolve(TOKEN.Lib.Express.Middleware.log);
  const metrics = resolve(TOKEN.Lib.Express.Middleware.metrics);
  const tracing = resolve(TOKEN.Lib.Express.Middleware.tracing);
  const errorHandle = resolve(TOKEN.Lib.Express.Middleware.error);

  const app = express();

  // регистрируем промежуточные слои
  app.use(['/', '/users', '/posts'], [requestHandle, logging, metrics, tracing]);

  // регистрируем роуты
  app.get('/', postsHandler);
  app.get('/posts', postsHandler);
  app.get('/authors', authorsHandler);
  app.get('/healthcheck', healthCheckHandler);

  // регистрируем промежуточный слой обработки ошибок
  app.use(['/', '/users', '/posts'], [errorHandle]);

  return app;
}
