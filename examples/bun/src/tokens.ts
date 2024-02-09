import { createToken } from '@sima-land/isomorph/di';
import { KnownToken } from '@sima-land/isomorph/tokens';

// чтобы токены можно было использовать как в браузере так и на сервере импорты должны содержать только типы
import type { Handler } from '@sima-land/isomorph/http';
import type { AuthorApi } from './entities/author';
import type { PostApi } from './entities/post';

export const TOKEN = {
  // реэкспорт "известных токенов" для удобного использования
  Lib: KnownToken,

  // далее идут токены компонентов нашего приложения
  Entities: {
    Author: {
      api: createToken<AuthorApi>('author/api'),
    },
    Post: {
      api: createToken<PostApi>('post/api'),
    },
  },
  Pages: {
    posts: createToken<Handler>('pages/posts'),
    authors: createToken<Handler>('pages/authors'),
  },
} as const;
