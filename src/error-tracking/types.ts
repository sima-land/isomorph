import type { SeverityLevel, Context, Extra, Breadcrumb } from '@sentry/types';

export interface ContextData {
  key: string;
  data: Context | null;
}

/**
 * Данные ошибки для Sentry.
 */
export interface SentryErrorData {
  level?: SeverityLevel;

  context?: ContextData | ContextData[];

  extra?: {
    key: string;
    data: Extra | null;
  };
}

/**
 * Данные хлебной крошки для Sentry.
 */
export type SentryBreadcrumbData = Breadcrumb;
