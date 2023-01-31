import { createToken } from '@sima-land/isomorph/di';
import type { Api, Config } from '../types';

export const TOKEN = {
  config: createToken<Config>('app/config'),
  api: createToken<Api>('app/api'),
} as const;
