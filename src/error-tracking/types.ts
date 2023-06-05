import type { SeverityLevel, Context, Extra, Breadcrumb } from '@sentry/types';

export interface ContextData {
  key: string;
  data: Context | null;
}

/**
 * Детали ошибки.
 */
export interface ErrorDetails {
  level?: SeverityLevel;

  context?: ContextData | ContextData[];

  extra?: {
    key: string;
    data: Extra | null;
  };
}

/**
 * Детали хлебной крошки.
 */
export type BreadcrumbDetails = Breadcrumb;
