import { createToken } from '@sima-land/isomorph/di';
import { KnownToken } from '@sima-land/isomorph/tokens';
import type { Handler } from '@sima-land/isomorph/http';

export const TOKEN = {
  Lib: KnownToken,
  Pages: {
    posts: createToken<Handler>('pages/posts'),
    authors: createToken<Handler>('pages/authors'),
  },
} as const;
