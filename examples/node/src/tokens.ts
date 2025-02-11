import { createToken } from '@sima-land/isomorph/di';
import { KnownToken } from '@sima-land/isomorph/tokens';

// чтобы токены можно было использовать как в браузере так и на сервере импорты должны содержать только типы
import type { AppConfig } from './app/types';
import type { Handler } from 'express';
import type { AuthorApi } from './entities/author';
import type { PostApi } from './entities/post';

export const TOKEN = {
  // реэкспорт "известных токенов" для удобного использования
  Lib: KnownToken,

  // далее идут токены компонентов нашего приложения
  config: createToken<AppConfig>('config'),
  Pages: {
    posts: createToken<Handler>('pages/posts'),
    authors: createToken<Handler>('pages/authors'),
    tracing: createToken<Handler>('pages/tracing'),
  },
  Entities: {
    Post: {
      api: createToken<PostApi>('post/api'),
    },
    Author: {
      api: createToken<AuthorApi>('author/api'),
    },
  },
} as const;
