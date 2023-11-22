import { createToken } from '@sima-land/isomorph/di';
import { KnownToken } from '@sima-land/isomorph/tokens';
import type { Handler } from '@sima-land/isomorph/http';

export const TOKEN = {
  // реэкспорт "известных токенов" для удобного использования
  Lib: KnownToken,

  // далее идут токены компонентов нашего приложения
  Pages: {
    posts: createToken<Handler>('pages/posts'),
    authors: createToken<Handler>('pages/authors'),
  },
} as const;
