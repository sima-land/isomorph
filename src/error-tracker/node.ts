import type { SentryLib } from './types';
import * as Sentry from '@sentry/node';

export function createSentryLib(options: Sentry.NodeOptions): SentryLib {
  return {
    client: new Sentry.NodeClient(options),
    withScope: Sentry.withScope,
  };
}
