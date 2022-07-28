import type { Severity, Context, Extra, Breadcrumb } from '@sentry/types';

/**
 * Данные ошибки для Sentry.
 */
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

/**
 * Данные хлебной крошки для Sentry.
 */
export type SentryBreadcrumbData = Breadcrumb;
