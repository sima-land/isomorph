import { TOKEN } from '../tokens';
import { AppConfig } from './types';
import express from 'express';
import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetNode, HandlerProvider } from '@sima-land/isomorph/preset/node';
import { UsersPageApp } from '../pages/users';
import { PostsPageApp } from '../pages/posts';

export function MainApp() {
  const app = createApplication();

  // используем пресет "node" с базовыми компонентами, такими как logger и тд
  app.preset(PresetNode());

  // добавляем в приложение собственные компоненты
  app.bind(TOKEN.Project.config).toProvider(provideAppConfig);
  app.bind(TOKEN.Project.Http.server).toProvider(provideHttpServer);
  app.bind(TOKEN.Project.Http.Pages.users).toProvider(HandlerProvider(UsersPageApp));
  app.bind(TOKEN.Project.Http.Pages.posts).toProvider(HandlerProvider(PostsPageApp));

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
  const usersHandler = resolve(TOKEN.Project.Http.Pages.users);
  const postsHandler = resolve(TOKEN.Project.Http.Pages.posts);
  const healthCheckHandler = resolve(TOKEN.Lib.Express.Handlers.healthCheck);

  // промежуточные слои (express) доступные из пресета PresetNode
  const requestHandle = resolve(TOKEN.Lib.Express.Middleware.request);
  const logging = resolve(TOKEN.Lib.Express.Middleware.log);
  const metrics = resolve(TOKEN.Lib.Express.Middleware.metrics);
  const tracing = resolve(TOKEN.Lib.Express.Middleware.tracing);
  const errorHandle = resolve(TOKEN.Lib.Express.Middleware.error);

  const app = express();

  // регистрируем промежуточные слои
  app.use(express.static('dist/static'));
  app.use(['/', '/users', '/posts'], [requestHandle, logging, metrics, tracing]);

  // регистрируем роуты
  app.get('/', postsHandler);
  app.get('/posts', postsHandler);
  app.get('/users', usersHandler);
  app.get('/healthcheck', healthCheckHandler);

  // регистрируем промежуточный слой обработки ошибок
  app.use(['/', '/users', '/posts'], [errorHandle]);

  return app;
}
