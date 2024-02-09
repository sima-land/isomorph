import { FetchUtil } from '@sima-land/isomorph/http';

export interface Post {
  id: number;
  title: string;
  body: string;
}

export type PostApi = ReturnType<typeof createPostApi>;

export function createPostApi({ host, fetch }: { host: string; fetch: typeof globalThis.fetch }) {
  return {
    getAll() {
      return fetch(new URL('/posts', host)).then(...FetchUtil.eitherResponse<Array<Post>>());
    },
  };
}
