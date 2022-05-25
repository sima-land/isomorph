import type { Client, Severity, Context, Extra, Breadcrumb } from '@sentry/types';
import type { withScope as withScopeBrowser } from '@sentry/browser';
import type { withScope as withScopeNode } from '@sentry/node';

export interface SentryLib {
  client: Client;
  withScope: typeof withScopeBrowser | typeof withScopeNode;
}

export interface SentryErrorData {
  level?: Severity;

  context?: {
    key: string;
    data: Context | null;
  };

  extra?: {
    key: string;
    data: Extra | null;
  };
}

export type SentryBreadcrumbData = Breadcrumb;
