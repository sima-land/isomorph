import type { Application } from '../container/application';
import type { Token, Provider } from '../container/types';

export type PresetEntry<T = any> = [Token<T>, Provider<T>];

export interface Preset {
  override: <T>(token: Token<T>, provider: Provider<T>) => this;
  apply: (app: Application) => void;
}
