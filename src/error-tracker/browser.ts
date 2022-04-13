import type { SentryLib } from './types';
import * as Sentry from '@sentry/browser';

export function createSentryLib(options: Sentry.BrowserOptions): SentryLib {
  return {
    client: new Sentry.BrowserClient(options),
    withScope: Sentry.withScope,
  };
}
