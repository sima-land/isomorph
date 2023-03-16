import { createToken } from '@sima-land/isomorph/di';
import type { HttpApi, Config } from '../types';

export const TOKEN = {
  config: createToken<Config>('app/config'),
  api: createToken<HttpApi>('app/api'),
} as const;
