import { FetchUtil } from '@sima-land/isomorph/http';

export interface Author {
  id: number;
  name: string;
  username: string;
}

export type AuthorApi = ReturnType<typeof createAuthorApi>;

export function createAuthorApi({ host, fetch }: { host: string; fetch: typeof globalThis.fetch }) {
  return {
    getAll() {
      return fetch(new URL('/users', host)).then(...FetchUtil.eitherResponse<Array<Author>>());
    },
  };
}
