import { createToken } from '@sima-land/isomorph/di';
import { KnownToken } from '@sima-land/isomorph/tokens';
import type { AppConfig, HttpApi } from '../app';
import type { Application, Handler } from 'express';

export const TOKEN = {
  // reexport for convenient use
  Known: KnownToken,

  // tokens for our application components
  appConfig: createToken<AppConfig>('app-config'),
  httpServer: createToken<Application>('http-server'),
  usersHandler: createToken<Handler>('users-handler'),
  postsHandler: createToken<Handler>('posts-handler'),
  httpApi: createToken<HttpApi>('response/api'),
} as const;
