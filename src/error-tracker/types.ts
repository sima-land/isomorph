import type { Severity, Context, Extra, Breadcrumb } from '@sentry/types';

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
