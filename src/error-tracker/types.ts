import type { Client } from '@sentry/types';
import type { withScope as withScopeBrowser } from '@sentry/browser';
import type { withScope as withScopeNode } from '@sentry/node';

export interface SentryLib {
  client: Client;
  withScope: typeof withScopeBrowser | typeof withScopeNode;
}
