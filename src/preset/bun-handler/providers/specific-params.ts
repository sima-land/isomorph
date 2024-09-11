/* eslint-disable jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';

export function provideSpecificParams(resolve: Resolve) {
  const context = resolve(KnownToken.Http.Handler.context);

  try {
    const headerValue = context.request.headers.get('simaland-params');

    return JSON.parse(headerValue ?? '{}');
  } catch {
    return {};
  }
}
