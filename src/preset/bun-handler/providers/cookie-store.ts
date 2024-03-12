/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { CookieStore, createCookieStore } from '../../../http';

export function provideCookieStore(resolve: Resolve): CookieStore {
  const context = resolve(KnownToken.Http.Handler.context);

  return createCookieStore(context.request.headers.get('cookie') ?? undefined);
}
