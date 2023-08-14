import { createToken } from '@sima-land/isomorph/di';
import { KnownToken } from '@sima-land/isomorph/tokens';
import type { AppConfig, HttpApi } from './app/types';
import type { Application, Handler } from 'express';

export const TOKEN = {
  // реэкспорт "известных токенов" для удобного использования
  Lib: KnownToken,

  // токены компонентов нашего приложения
  Project: {
    config: createToken<AppConfig>('config'),
    Http: {
      api: createToken<HttpApi>('http/api'),
      server: createToken<Application>('http/server'),
      Pages: {
        users: createToken<Handler>('pages/users'),
        posts: createToken<Handler>('pages/posts'),
      },
    },
  },
} as const;
