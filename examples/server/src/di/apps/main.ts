import { TOKEN } from '../tokens';
import { AppConfig } from '../../app';
import express, { Application as ExpressApp } from 'express';
import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetNode } from '@sima-land/isomorph/preset/node';
import { HandlerProvider } from '@sima-land/isomorph/preset/node/handler';
import { healthCheck } from '@sima-land/isomorph/http-server/handler/health-check';
import { UsersHandler } from './users';
import { PostsHandler } from './posts';

export function MainApp() {
  const app = createApplication();

  app.preset(PresetNode());

  app.bind(TOKEN.appConfig).toProvider(provideAppConfig);
  app.bind(TOKEN.httpServer).toProvider(provideHttpServer);
  app.bind(TOKEN.usersHandler).toProvider(HandlerProvider(UsersHandler));
  app.bind(TOKEN.postsHandler).toProvider(HandlerProvider(PostsHandler));

  return app;
}

function provideAppConfig(resolve: Resolve): AppConfig {
  const source = resolve(TOKEN.Known.Config.source);
  const base = resolve(TOKEN.Known.Config.base);

  return {
    ...base,
    httpPort: {
      main: Number(source.require('MAIN_HTTP_PORT')) || -1,
      metrics: Number(source.require('METRICS_HTTP_PORT')) || -1,
    },
  };
}

function provideHttpServer(resolve: Resolve): ExpressApp {
  const createServer = resolve(TOKEN.Known.Http.Server.factory);
  const usersHandler = resolve(TOKEN.usersHandler);
  const postsHandler = resolve(TOKEN.postsHandler);

  // builtin middleware
  const requestHandle = resolve(TOKEN.Known.Http.Server.Middleware.request);
  const logging = resolve(TOKEN.Known.Http.Server.Middleware.log);
  const metrics = resolve(TOKEN.Known.Http.Server.Middleware.metrics);
  const tracing = resolve(TOKEN.Known.Http.Server.Middleware.tracing);
  const errorHandle = resolve(TOKEN.Known.Http.Server.Middleware.error);

  const app = createServer();

  // register middleware
  app.use(express.static('dist/static'));
  app.use(['/', '/users', '/posts'], [requestHandle, logging, metrics, tracing, errorHandle]);

  // register routes
  app.get('/', usersHandler);
  app.get('/users', usersHandler);
  app.get('/posts', postsHandler);
  app.get('/healthcheck', healthCheck());

  return app;
}
