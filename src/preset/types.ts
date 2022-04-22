import type { Token, Provider, Container } from '../container/types';

export type PresetEntry<T = any> = [Token<T>, Provider<T>];

export interface Preset {
  override: <T>(token: Token<T>, provider: Provider<T>) => void;
  apply: (container: Container) => void;
}
