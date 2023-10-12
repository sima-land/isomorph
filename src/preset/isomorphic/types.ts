import type { Provider, Token } from '../../di';

export interface PresetTuner {
  (tools: { override: <T>(token: Token<T>, provider: Provider<T>) => void }): void;
}

export type KnownHttpApiKey = 'ilium' | 'simaV3' | 'simaV4' | 'simaV6';

/**
 * Строгая версия Map без возможности добавлять/удалять.
 */
export interface StrictMap<Key extends string> {
  /** Возвращает значение по ключу. */
  get(key: Key): string;
}

/**
 * Внутренний интерфейс для хранения ссылок на ассеты.
 */
export interface PageAssets {
  js: string;
  css: string;
  criticalJs?: string;
  criticalCss?: string;
}

/**
 * Структура ответа от frontend-микросервиса в формате JSON по соглашению.
 */
export interface ConventionalJson {
  markup: string;
  bundle_js: string;
  bundle_css: string;
  critical_js?: string;
  critical_css?: string;
  meta?: any;
}
